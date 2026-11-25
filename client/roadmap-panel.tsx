import {
  type PluginWorkspacePanelProps,
  useRpc,
} from "@getpaseo/plugin/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { getRoadmap, type RoadmapItem, type RoadmapWave } from "../shared/roadmap";

const STATUS_META: Record<RoadmapItem["status"], { glyph: string; label: string }> = {
  done: { glyph: "✓", label: "erledigt" },
  active: { glyph: "▶", label: "läuft" },
  next: { glyph: "○", label: "anstehend" },
  waiting: { glyph: "⏸", label: "wartet" },
  blocked: { glyph: "✕", label: "blockiert" },
};

function ProgressBar({
  progress,
  colors,
}: {
  progress: number;
  colors: { accent: string; surface2: string };
}) {
  return (
    <View
      style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.surface2,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${Math.round(progress * 100)}%`,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.accent,
        }}
      />
    </View>
  );
}

function WaveCard({
  wave,
  theme,
  compact,
}: {
  wave: RoadmapWave;
  theme: PluginWorkspacePanelProps["theme"];
  compact: boolean;
}) {
  const c = theme.colors;
  return (
    <View
      style={{
        minWidth: compact ? 220 : 260,
        maxWidth: compact ? 240 : 300,
        backgroundColor: c.surface1,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.border,
        padding: 12,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ color: c.foreground, fontWeight: "700", fontSize: 14 }}>
          {wave.id} · {wave.name}
        </Text>
        <Text style={{ color: c.foregroundMuted, fontSize: 11 }}>{wave.window}</Text>
      </View>
      <ProgressBar progress={wave.progress} colors={{ accent: c.accent, surface2: c.surface2 }} />
      <View style={{ gap: 4 }}>
        {wave.items.map((item) => {
          const meta = STATUS_META[item.status];
          const muted = item.status === "next" || item.status === "waiting";
          return (
            <View key={item.id} style={{ flexDirection: "row", gap: 6, alignItems: "baseline" }}>
              <Text
                style={{
                  color: item.status === "done" ? c.accent : item.status === "active" ? c.foreground : c.foregroundMuted,
                  fontSize: 12,
                  width: 14,
                }}
              >
                {meta.glyph}
              </Text>
              <Text
                style={{
                  color: muted ? c.foregroundMuted : c.foreground,
                  fontSize: 12,
                  flex: 1,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{item.id}</Text> {item.title}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function RoadmapPanel({ theme, layout }: PluginWorkspacePanelProps) {
  const rpc = useRpc(getRoadmap);
  const query = useQuery({
    queryKey: ["roadmap"],
    queryFn: () => rpc({}),
    refetchInterval: 60_000,
  });
  const c = theme.colors;
  const compact = layout.compact;
  const styles = useMemo(
    () => ({
      screen: {
        flex: 1,
        backgroundColor: c.surface0,
        padding: compact ? 12 : 16,
        gap: 10,
      },
      header: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "baseline" as const },
      waves: { flexDirection: "row" as const, gap: 10 },
    }),
    [c, compact],
  );

  const data = query.data;
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={{ color: c.foreground, fontSize: compact ? 16 : 18, fontWeight: "700" }}>
          {data?.roadmap.title ?? "Roadmap"}
        </Text>
        <Text style={{ color: c.foregroundMuted, fontSize: 11 }}>
          Stand {data?.roadmap.stand ?? "…"}
        </Text>
      </View>
      {data?.error ? (
        <Text style={{ color: c.foregroundMuted, fontSize: 12 }}>{data.error}</Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.waves}>
          {(data?.roadmap.waves ?? []).map((wave) => (
            <WaveCard key={wave.id} wave={wave} theme={theme} compact={compact} />
          ))}
        </View>
      </ScrollView>
      <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap" }}>
        {(data?.roadmap.milestones ?? []).map((m) => (
          <Text key={m.date} style={{ color: c.foregroundMuted, fontSize: 11 }}>
            ◆ {m.date.slice(5).split("-").reverse().join(".")} · {m.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

