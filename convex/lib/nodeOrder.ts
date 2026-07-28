import { Infer } from "convex/values";
import { roadmapDataValidator } from "../roadmap/roadmap";

type RoadmapData = Infer<typeof roadmapDataValidator>;

export function getOrderedNodeIds(roadmapData: RoadmapData): string[] {
  return roadmapData.sections.flatMap((section) => [
    ...section.leftNodes.map((n) => n.id),
    ...section.rightNodes.map((n) => n.id),
  ]);
}
// mmm
