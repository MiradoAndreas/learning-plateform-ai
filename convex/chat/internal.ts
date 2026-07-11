import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const getSession = internalQuery({
  args: { sessionId: v.id("chat_sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session introuvable");
    return session;
  },
});

export const getSessionMessages = internalQuery({
  args: { sessionId: v.id("chat_sessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("chat_messages")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
  },
});

export const saveMessage = internalMutation({
  args: {
    sessionId: v.id("chat_sessions"),
    roadmapId: v.id("roadmaps"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    mermaid: v.optional(v.string()), // 👈 nouveau
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chat_messages", args);
  },
});

// Renomme automatiquement la session avec le premier message envoyé,
// tant que le titre par défaut n'a pas été changé.
export const maybeSetSessionTitle = internalMutation({
  args: { sessionId: v.id("chat_sessions"), title: v.string() },
  handler: async (ctx, { sessionId, title }) => {
    const session = await ctx.db.get(sessionId);
    if (!session || session.title !== "Nouvelle discussion") return;
    await ctx.db.patch(sessionId, { title: title.slice(0, 60) });
  },
});
