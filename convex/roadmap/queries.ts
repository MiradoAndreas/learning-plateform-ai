import { documentValidator } from "../lib/documents";
import { getOrderedNodeIds, getUnlockedNodeIds } from "./progress/model";
import { listRoadmapProjects } from "./projects/model";
import { listRoadmapQuestions } from "./questions/model";
import { requireOwnedRoadmap } from "./access";
import { requireIdentity } from "../lib/auth";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { DASHBOARD_ROADMAP_LIMIT } from "./constants";

export const getRecentRoadmaps = query({
  args: {},
  returns: v.array(documentValidator("roadmaps")),
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);

    return await ctx.db
      .query("roadmaps")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(DASHBOARD_ROADMAP_LIMIT + 1);
  },
});

export const getRoadmapProjects = query({
  args: { roadmapId: v.id("roadmaps") },
  returns: v.array(documentValidator("roadmapProjects")),
  handler: async (ctx, { roadmapId }) => {
    const identity = await requireIdentity(ctx);

    await requireOwnedRoadmap(ctx, roadmapId, identity.subject);

    return await listRoadmapProjects(ctx, roadmapId);
  },
});

export const getRoadmap = query({
  args: { roadmapId: v.id("roadmaps") },
  returns: documentValidator("roadmaps"),
  handler: async (ctx, { roadmapId }) => requireOwnedRoadmap(ctx, roadmapId),
});

export const getRoadmapQuestions = query({
  args: { roadmapId: v.id("roadmaps") },
  returns: v.array(documentValidator("roadmap_questions")),
  handler: async (ctx, { roadmapId }) => {
    await requireOwnedRoadmap(ctx, roadmapId);
    return await listRoadmapQuestions(ctx, roadmapId);
  },
});

export const listMyRoadmaps = query({
  args: {},
  returns: v.array(documentValidator("roadmaps")),
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const getRoadmapProgress = query({
  args: { roadmapId: v.id("roadmaps") },
  returns: v.object({
    orderedNodeIds: v.array(v.string()),
    completedNodeIds: v.array(v.string()),
    unlockedNodeIds: v.array(v.string()),
  }),
  handler: async (ctx, { roadmapId }) => {
    const identity = await requireIdentity(ctx);

    const roadmap = await requireOwnedRoadmap(ctx, roadmapId, identity.subject);

    if (!roadmap.roadmapData) {
      return { orderedNodeIds: [], completedNodeIds: [], unlockedNodeIds: [] };
    }

    const orderedNodeIds = getOrderedNodeIds(roadmap.roadmapData);

    const completedRows = await ctx.db
      .query("roadmapNodeProgress")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", roadmapId))
      .collect();

    const completedNodeIds = new Set(completedRows.map((r) => r.nodeId));

    const unlockedNodeIds = getUnlockedNodeIds(
      orderedNodeIds,
      completedNodeIds,
    );

    return {
      orderedNodeIds,
      completedNodeIds: [...completedNodeIds],
      unlockedNodeIds,
    };
  },
});
