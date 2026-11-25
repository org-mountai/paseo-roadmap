import { readFile } from "node:fs/promises";
import { getRoadmap } from "../shared/roadmap";

const ROADMAP_FILE = "/home/companion/companion/world/roadmap.md";

export async function readRoadmap() {
  try {
    const text = await readFile(ROADMAP_FILE, "utf8");
    const match = text.match(/```json\s*([\s\S]*?)```/);
    if (!match) {
      return {
        roadmap: { title: "Roadmap", stand: "", waves: [], milestones: [] },
        error: "Kein json-Block in world/roadmap.md gefunden.",
      };
    }
    const parsed = JSON.parse(match[1]);
    return { roadmap: parsed };
  } catch (error) {
    return {
      roadmap: { title: "Roadmap", stand: "", waves: [], milestones: [] },
      error: `Lesefehler: ${String(error).slice(0, 200)}`,
    };
  }
}
