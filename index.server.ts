import type { PluginServerContext } from "@getpaseo/plugin/server";
import { getRoadmap } from "./shared/roadmap";
import { readRoadmap } from "./server/roadmap";

export default function contribute(server: PluginServerContext) {
  server.handle(getRoadmap, readRoadmap);
  return () => {};
}
