import { v } from "convex/values";
import { query } from "../_generated/server";

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
      .query("chat_sessions")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", roadmapId))
      .order("desc")
      .collect();
  },
});

export const listMessages = query({
  args: { sessionId: v.id("chat_sessions") },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    return await ctx.db
      .query("chat_messages")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
  },
});
