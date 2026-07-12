import { v } from "convex/values";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { listUIMessages } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const listSessions = query({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap || roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    return await ctx.db
      .query("roadmapThreads")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", roadmapId))
      .order("desc")
      .collect();
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { threadId, paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const thread = await ctx.db
      .query("roadmapThreads")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .unique();

    if (!thread || thread.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    return await listUIMessages(ctx, components.agent, {
      threadId,
      paginationOpts,
    });
  },
});
