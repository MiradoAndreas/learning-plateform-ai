import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const getSessionByThreadId = internalQuery({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    return await ctx.db
      .query("roadmapThreads")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .unique();
  },
});

export const incrementSessionMessageCount = internalMutation({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const session = await ctx.db
      .query("roadmapThreads")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .unique();

    if (!session) return;

    await ctx.db.patch(session._id, {
      messageCount: (session.messageCount ?? 0) + 1,
    });
  },
});
export const patchSessionTitleByThreadId = internalMutation({
  args: {
    threadId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, { threadId, title }) => {
    const session = await ctx.db
      .query("roadmapThreads")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .unique();

    if (!session) return;

    await ctx.db.patch(session._id, { title });
  },
});
