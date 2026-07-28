// convex/roadmaps/queries.ts
import { v } from "convex/values";
import { query, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { getOrderedNodeIds } from "../lib/nodeOrder";

export const getRoadmapProjects = query({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap || roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    return await ctx.db
      .query("roadmapProjects")
      .withIndex("by_roadmap_and_order", (q) => q.eq("roadmapId", roadmapId))
      .collect();
  },
});

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

export const getRoadmapProgress = query({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap || roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    if (!roadmap.roadmapData) {
      return { orderedNodeIds: [], completedNodeIds: [], unlockedNodeIds: [] };
    }

    const orderedNodeIds = getOrderedNodeIds(roadmap.roadmapData);

    const completedRows = await ctx.db
      .query("roadmapNodeProgress")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", roadmapId))
      .collect();

    const completedNodeIds = new Set(completedRows.map((r) => r.nodeId));

    const unlockedNodeIds: string[] = [];
    for (let i = 0; i < orderedNodeIds.length; i++) {
      const nodeId = orderedNodeIds[i];
      const isFirst = i === 0;
      const previousCompleted =
        i > 0 && completedNodeIds.has(orderedNodeIds[i - 1]);

      if (isFirst || previousCompleted || completedNodeIds.has(nodeId)) {
        unlockedNodeIds.push(nodeId);
      } else {
        break; // séquence strictement linéaire
      }
    }

    return {
      orderedNodeIds,
      completedNodeIds: [...completedNodeIds],
      unlockedNodeIds,
    };
  },
});
