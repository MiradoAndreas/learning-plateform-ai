import { documentValidator } from "../lib/documents";
import { getSessionByThreadId as findSessionByThreadId } from "./data";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const getSessionByThreadId = internalQuery({
  args: { threadId: v.string() },
  returns: v.union(documentValidator("roadmapThreads"), v.null()),
  handler: async (ctx, { threadId }) => {
    return await findSessionByThreadId(ctx, threadId);
  },
});

export const incrementSessionMessageCount = internalMutation({
  args: { threadId: v.string() },
  returns: v.null(),
  handler: async (ctx, { threadId }) => {
    const session = await findSessionByThreadId(ctx, threadId);

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
  returns: v.null(),
  handler: async (ctx, { threadId, title }) => {
    const session = await findSessionByThreadId(ctx, threadId);

    if (!session) return;

    await ctx.db.patch(session._id, { title });
  },
});
