// convex/roadmaps/queries.ts
import { v } from "convex/values";
import { query, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

async function requireOwnedRoadmap(ctx: QueryCtx, roadmapId: Id<"roadmaps">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Non authentifié");
  const roadmap = await ctx.db.get(roadmapId);
  if (!roadmap || roadmap.userId !== identity.subject) {
    throw new Error("Introuvable");
  }
  return roadmap;
}

export const getRoadmap = query({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => requireOwnedRoadmap(ctx, roadmapId),
});

export const getRoadmapQuestions = query({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => {
    await requireOwnedRoadmap(ctx, roadmapId);
    return await ctx.db
      .query("roadmap_questions")
      .withIndex("by_roadmap_and_order", (q) => q.eq("roadmapId", roadmapId))
      .collect();
  },
});

export const listMyRoadmaps = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});
