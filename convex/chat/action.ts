import { buildTutorPrompt } from "./prompts";
import { retrieveTutorContext } from "./rag";
import { prepareLearningContext } from "./learningRetrieval";
import { requireIdentity } from "../lib/auth";
import { ConvexError, v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { learningAgent } from "../agents/learning";
import z from "zod";
import { MAX_EXCHANGES_PER_THREAD, DEFAULT_SESSION_TITLE } from "./constants";

export const sendMessage = action({
  args: {
    threadId: v.string(),
    roadmapId: v.id("roadmaps"),
    content: v.string(),
  },
  returns: v.object({ text: v.string() }),
  handler: async (
    ctx,
    { threadId, roadmapId, content },
  ): Promise<{ text: string }> => {
    const identity = await requireIdentity(ctx);

    const session = await ctx.runQuery(
      internal.chat.internal.getSessionByThreadId,
      {
        threadId,
      },
    );

    if (
      !session ||
      session.userId !== identity.subject ||
      session.roadmapId !== roadmapId
    ) {
      throw new Error("Introuvable");
    }

    if ((session.messageCount ?? 0) >= MAX_EXCHANGES_PER_THREAD) {
      throw new ConvexError({
        code: "THREAD_LIMIT_REACHED",
        message:
          "Cette discussion a atteint sa limite d'échanges. Créez une nouvelle discussion pour continuer.",
      });
    }

    const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
      roadmapId,
    });
    if (roadmap.userId !== identity.subject) throw new Error("Introuvable");

    const preferences = await ctx.runQuery(
      internal.roadmap.internal.getRoadmapPreferences,
      {
        roadmapId,
      },
    );

    const learning = await prepareLearningContext(
      ctx,
      roadmap,
      threadId,
      content,
    );
    const progress = await ctx.runQuery(
      internal.chat.learningMemory.getProgressContext,
      {
        roadmapId,
        userId: identity.subject,
      },
    );
    const retrievedContext = await retrieveTutorContext(
      ctx,
      roadmap,
      learning.query,
      progress,
    );
    const system = buildTutorPrompt(
      roadmap,
      preferences,
      retrievedContext,
      learning.context,
    );

    const { thread } = await learningAgent.continueThread(ctx, {
      threadId,
    });

    const result = await thread.streamText(
      { system, prompt: content },
      { saveStreamDeltas: { throttleMs: 100 } },
    );

    await ctx.runMutation(internal.chat.internal.incrementSessionMessageCount, {
      threadId,
    });

    const metadata = await thread.getMetadata();

    console.log("metadata", metadata);

    if (metadata.title === DEFAULT_SESSION_TITLE) {
      await ctx.scheduler.runAfter(
        0,
        internal.chat.action.generateThreadTitle,
        {
          threadId,
          firstMessage: content,
        },
      );
    }

    console.log("message : ", result.text);

    return {
      text: await result.text,
    };
  },
});

const titleSchema = z.object({
  title: z
    .string()
    .describe(
      "Titre court (6 mots maximum), sans guillemets ni ponctuation finale, résumant le sujet de la conversation.",
    ),
});

export const generateThreadTitle = internalAction({
  args: {
    threadId: v.string(),
    firstMessage: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { threadId, firstMessage }) => {
    const { thread } = await learningAgent.continueThread(ctx, { threadId });

    const { object } = await thread.generateObject(
      {
        prompt: `Génère un titre très court résumant ce sujet de discussion : "${firstMessage}"`,
        schema: titleSchema,
      },
      {
        storageOptions: { saveMessages: "none" },
      },
    );

    await thread.updateMetadata({
      title: object.title,
    });

    await ctx.runMutation(internal.chat.internal.patchSessionTitleByThreadId, {
      threadId,
      title: object.title,
    });
  },
});
