import type { QueryCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";

export function listRoadmapProjects(
  ctx: Pick<QueryCtx, "db">,
  roadmapId: Id<"roadmaps">,
) {
  return ctx.db
    .query("roadmapProjects")
    .withIndex("by_roadmap_and_order", (q) => q.eq("roadmapId", roadmapId))
    .collect();
}
