// convex/roadmap/actions.ts
"use node"; // si generateText nécessite l'environnement Node

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { generateQuestions } from "@/modules/roadmap/lib/roadmap-generator";
import { generateRoadmap } from "./ai";

export const generateQuestionsAction = action({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => {
    const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
      roadmapId,
    });

    await ctx.runMutation(internal.roadmap.internal.setStatus, {
      roadmapId,
      status: "generating_questions",
    });

    try {
      const { questions } = await generateQuestions({ topic: roadmap.topic });

      await ctx.runMutation(internal.roadmap.internal.saveGeneratedQuestions, {
        roadmapId,
        questions,
      });

      return { questions };
    } catch (err) {
      await ctx.runMutation(internal.roadmap.internal.setFailed, {
        roadmapId,
        errorMessage:
          err instanceof Error ? err.message : "Erreur génération questions",
      });
      throw err;
    }
  },
});

export const submitAnswersAndGenerateRoadmap = action({
  args: {
    roadmapId: v.id("roadmaps"),
    answers: v.array(v.object({ key: v.string(), value: v.string() })),
  },
  handler: async (ctx, { roadmapId, answers }) => {
    await ctx.runMutation(internal.roadmap.internal.saveAnswers, {
      roadmapId,
      answers,
    });

    const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
      roadmapId,
    });

    try {
      const result = await generateRoadmap({
        topic: roadmap.topic,
        answers,
      });

      console.log("result : ", result);

      await ctx.runMutation(internal.roadmap.internal.saveRoadmapResult, {
        roadmapId,
        title: result.title,
        summary: result.summary,
        roadmapData: result.roadmapData,
      });
    } catch (err) {
      await ctx.runMutation(internal.roadmap.internal.setFailed, {
        roadmapId,
        errorMessage:
          err instanceof Error ? err.message : "Erreur génération roadmap",
      });
      throw err;
    }
  },
});
