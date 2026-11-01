import type { QueryCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";

export function listRoadmapQuestions(
  ctx: Pick<QueryCtx, "db">,
  roadmapId: Id<"roadmaps">,
) {
  return ctx.db
    .query("roadmap_questions")
    .withIndex("by_roadmap_and_order", (q) => q.eq("roadmapId", roadmapId))
    .collect();
}

export function toFieldKey(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
