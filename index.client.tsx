import type {
  PluginButtonRegistration,
  PluginClientContext,
} from "@getpaseo/plugin/client";
import { RoadmapPanel } from "./client/roadmap-panel";

export default function contribute(client: PluginClientContext) {
  client.addWorkspacePanel({
    id: "roadmap",
    title: "Roadmap",
    icon: "Map",
    context: "workspace",
    Component: RoadmapPanel,
  });
  client.addCommandCenterItem({
    id: "open-roadmap",
    title: "Roadmap öffnen",
    icon: "Map",
    context: "workspace",
    onSelect({ openPanel }) {
      openPanel("roadmap");
    },
  });

  const pills = new Map<string, PluginButtonRegistration>();
  const lifetime = new AbortController();
  const register = (agent: { id: string; workspaceId?: string | null }) => {
    if (lifetime.signal.aborted || !agent.workspaceId) return;
    const agentId = agent.id;
    const workspaceId = agent.workspaceId;
    pills.get(agentId)?.remove();
    pills.set(
      agentId,
      client.addComposerPill({
        id: "roadmap",
        workspaceId,
        agentId,
        button: {
          title: "Roadmap öffnen",
          icon: "Map",
          label: "Roadmap",
          behavior: {
            kind: "action",
            onPress() {
              client.openPanel("roadmap", { workspaceId, agentId });
            },
          },
        },
      }),
    );
  };
  const removeAll = () => {
    for (const pill of pills.values()) pill.remove();
    pills.clear();
  };
  void client.paseo.agents
    .list({ subscribe: {}, signal: lifetime.signal })
    .then(({ subscription }) => {
      subscription.subscribe({
        snapshot: ({ entries }) => {
          removeAll();
          for (const { agent } of entries) register(agent);
        },
        update: (message) => {
          if (message.type !== "agent_update") return;
          const update = message.payload;
          if (update.kind === "upsert") return register(update.agent);
          pills.get(update.agentId)?.remove();
          pills.delete(update.agentId);
        },
      });
      return undefined;
    })
    .catch((error) => {
      if (!lifetime.signal.aborted) console.error("Agent observation failed", error);
    });

  return () => {
    lifetime.abort();
    removeAll();
  };
}
