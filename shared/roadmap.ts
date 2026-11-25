import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const roadmapItem = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["done", "active", "next", "waiting", "blocked"]),
});

export const roadmapWave = z.object({
  id: z.string(),
  name: z.string(),
  window: z.string(),
  progress: z.number().min(0).max(1),
  items: z.array(roadmapItem),
});

export const roadmapMilestone = z.object({
  date: z.string(),
  label: z.string(),
  status: z.enum(["done", "active", "next", "waiting", "blocked"]),
});

export const roadmap = z.object({
  title: z.string(),
  stand: z.string(),
  waves: z.array(roadmapWave),
  milestones: z.array(roadmapMilestone),
});

export const getRoadmap = defineRpc({
  name: "roadmap.get",
  input: z.object({}),
  output: z.object({ roadmap, error: z.string().optional() }),
});

export type Roadmap = z.infer<typeof roadmap>;
export type RoadmapWave = z.infer<typeof roadmapWave>;
export type RoadmapItem = z.infer<typeof roadmapItem>;
