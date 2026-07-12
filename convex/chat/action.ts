import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { learningAgent } from "../agents/leaningAgent";

export const sendMessage = action({
  args: {
    threadId: v.string(),
    roadmapId: v.id("roadmaps"),
    content: v.string(),
  },
  handler: async (
    ctx,
    { threadId, roadmapId, content },
  ): Promise<{ text: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
      roadmapId,
    });

    const result = await learningAgent.generateText(
      ctx,
      { threadId },
      {
        system: `Contexte de la roadmap actuelle :
Sujet : ${roadmap.topic}
Titre : ${roadmap.title ?? "N/A"}
Résumé : ${roadmap.summary ?? "N/A"}`,
        prompt: content,
      },
    );

    return { text: result.text };
  },
});
