import { threadMessagesValidator } from "./validators";
import { documentValidator } from "../lib/documents";
import { requireOwnedSession } from "./data";
import { requireOwnedRoadmap } from "../roadmap/access";
import { requireIdentity } from "../lib/auth";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { listUIMessages } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const listSessions = query({
  args: { roadmapId: v.id("roadmaps") },
  returns: v.array(documentValidator("roadmapThreads")),
  handler: async (ctx, { roadmapId }) => {
    const identity = await requireIdentity(ctx);

    await requireOwnedRoadmap(ctx, roadmapId, identity.subject);

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
  returns: threadMessagesValidator,
  handler: async (ctx, { threadId, paginationOpts }) => {
    const identity = await requireIdentity(ctx);

    await requireOwnedSession(ctx, threadId, identity.subject);

    return await listUIMessages(ctx, components.agent, {
      threadId,
      paginationOpts,
    });
  },
});

export const getSession = query({
  args: { threadId: v.string() },
  returns: documentValidator("roadmapThreads"),
  handler: async (ctx, { threadId }) => {
    const identity = await requireIdentity(ctx);

    const session = await requireOwnedSession(ctx, threadId, identity.subject);

    return session;
  },
});
