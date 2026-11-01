import type { UserIdentity } from "convex/server";
import { internal } from "../_generated/api";
import type { QueryCtx, ActionCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";
import { requireIdentity } from "../lib/auth";

type ReadContext = Pick<QueryCtx, "auth" | "db">;

export async function requireOwnedRoadmap(
  ctx: ReadContext,
  roadmapId: Id<"roadmaps">,
  userId?: string,
) {
  const subject = userId ?? (await requireIdentity(ctx)).subject;
  const roadmap = await ctx.db.get(roadmapId);
  if (!roadmap || roadmap.userId !== subject) throw new Error("Introuvable");
  return roadmap;
}

export async function requireOwnedRoadmapForAction(
  ctx: ActionCtx,
  roadmapId: Id<"roadmaps">,
): Promise<{ identity: UserIdentity; roadmap: Doc<"roadmaps"> }> {
  const identity = await requireIdentity(ctx);
  const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
    roadmapId,
  });
  if (roadmap.userId !== identity.subject) throw new Error("Introuvable");
  return { identity, roadmap };
}
