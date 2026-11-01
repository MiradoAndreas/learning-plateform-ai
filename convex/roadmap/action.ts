import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { generateQuestions } from "./questions/generation";
import { generateRoadmap } from "./generation/pipeline";
import { generateProjects } from "./projects/generation";
import { getOrCreateQuiz } from "./progress/generation";

export const generateRoadmapProjects = action({
  args: { roadmapId: v.id("roadmaps") },
  returns: v.null(),
  handler: generateProjects,
});

export const generateQuestionsAction = action({
  args: { roadmapId: v.id("roadmaps") },
  returns: v.object({
    questions: v.array(
      v.object({
        key: v.string(),
        title: v.string(),
        description: v.string(),
        required: v.boolean(),
        options: v.array(v.string()),
      }),
    ),
  }),
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
  returns: v.null(),
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

export const getOrCreateNodeQuiz = action({
  args: {
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    nodeLabel: v.string(),
  },
  returns: v.object({
    quizId: v.string(),
    questions: v.array(
      v.object({ question: v.string(), options: v.array(v.string()) }),
    ),
  }),
  handler: getOrCreateQuiz,
});
