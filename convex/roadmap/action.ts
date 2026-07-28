import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { generateQuestions } from "@/modules/roadmap/lib/roadmap-generator";
import { generateRoadmap } from "./ai";
import z from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

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

const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().min(0).max(3),
      }),
    )
    .length(5),
});

export const getOrCreateNodeQuiz = action({
  args: {
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    nodeLabel: v.string(),
  },
  handler: async (
    ctx,
    { roadmapId, nodeId, nodeLabel },
  ): Promise<{
    quizId: string;
    questions: { question: string; options: string[] }[];
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
      roadmapId,
    });
    if (roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    const existing = await ctx.runQuery(internal.roadmap.internal.getNodeQuiz, {
      roadmapId,
      nodeId,
    });

    if (existing) {
      return {
        quizId: existing._id,
        questions: existing.questions.map(({ question, options }) => ({
          question,
          options,
        })),
      };
    }

    const { object } = await generateObject({
      model: openai.chat("gpt-4o-mini"),
      schema: quizSchema,
      prompt: `Génère un quiz de 5 questions à choix multiples (4 options chacune) en français pour valider la compréhension du sujet "${nodeLabel}" dans le contexte de la roadmap "${roadmap.title ?? roadmap.topic}". Niveau débutant à intermédiaire, une seule bonne réponse par question.`,
    });

    const quizId = await ctx.runMutation(
      internal.roadmap.internal.saveNodeQuiz,
      {
        roadmapId,
        nodeId,
        questions: object.questions,
      },
    );

    return {
      quizId,
      questions: object.questions.map(({ question, options }) => ({
        question,
        options,
      })),
    };
  },
});
