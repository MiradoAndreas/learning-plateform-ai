"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { generateChatReply } from "./ai";

export const sendMessage = action({
  args: { sessionId: v.id("chat_sessions"), content: v.string() },
  handler: async (ctx, { sessionId, content }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const session = await ctx.runQuery(internal.chat.internal.getSession, {
      sessionId,
    });
    if (session.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    const existingMessages = await ctx.runQuery(
      internal.chat.internal.getSessionMessages,
      { sessionId },
    );
    const isFirstMessage = existingMessages.length === 0;

    // 1. On sauvegarde immédiatement le message utilisateur
    await ctx.runMutation(internal.chat.internal.saveMessage, {
      sessionId,
      roadmapId: session.roadmapId,
      role: "user",
      content,
    });

    if (isFirstMessage) {
      await ctx.runMutation(internal.chat.internal.maybeSetSessionTitle, {
        sessionId,
        title: content,
      });
    }

    // 2. On récupère le contexte (roadmap + historique complet)
    const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
      roadmapId: session.roadmapId,
    });
    const history = await ctx.runQuery(
      internal.chat.internal.getSessionMessages,
      { sessionId },
    );

    // 3. Appel IA
    const reply = await generateChatReply({
      context: {
        topic: roadmap.topic,
        title: roadmap.title,
        summary: roadmap.summary,
        mermaid: roadmap.mermaid,
      },
      history: history.map((m) => ({ role: m.role, content: m.content })),
    });

    // 4. On persiste la réponse
    await ctx.runMutation(internal.chat.internal.saveMessage, {
      sessionId,
      roadmapId: session.roadmapId,
      role: "assistant",
      content: reply,
    });

    return { reply };
  },
});
