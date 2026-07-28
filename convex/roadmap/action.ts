import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { generateQuestions } from "@/modules/roadmap/lib/roadmap-generator";
import { generateRoadmap } from "./ai";
import z from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { SKILL_LEVELS } from "./constants";
import { learningAgent } from "../agents/leaningAgent";

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  objectives: z.array(z.string()).min(2).max(5),
  skillsPracticed: z.array(z.string()).min(1).max(5),
  estimatedDuration: z.string(),
});

const projectsResponseSchema = z.object({
  projects: z.array(projectSchema).length(SKILL_LEVELS.length),
});

export const generateRoadmapProjects = action({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
      roadmapId,
    });
    if (roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    // Idempotence : évite une double génération si le hook se déclenche
    // deux fois (StrictMode en dev, ou deux onglets ouverts sur la même
    // roadmap au même moment).
    const existing = await ctx.runQuery(
      internal.roadmap.internal.getRoadmapProjectsInternal,
      { roadmapId },
    );
    if (existing.length > 0) return;

    // Thread jetable : pas lié à roadmapThreads, rien à conserver.
    const { thread } = await learningAgent.createThread(ctx, {
      userId: identity.subject,
    });

    const { object } = await thread.generateObject(
      {
        prompt: `Tu es un concepteur pédagogique expert. Pour le domaine d'apprentissage suivant : "${roadmap.title ?? roadmap.topic}" (sujet : "${roadmap.topic}"), génère exactement ${SKILL_LEVELS.length} projets pratiques en français, un par niveau de compétence, dans cet ordre croissant de difficulté : ${SKILL_LEVELS.join(", ")}.

Chaque projet doit :
- avoir un titre court et concret
- avoir une description claire de 2 à 4 phrases expliquant ce que l'utilisateur va construire
- lister entre 2 et 5 objectifs pédagogiques précis
- lister les compétences pratiquées
- indiquer une durée estimée réaliste (ex: "2-3 heures", "1 semaine")

Le niveau "${SKILL_LEVELS[0]}" doit être accessible à un débutant complet, sans aucun prérequis.
Le niveau "${SKILL_LEVELS[SKILL_LEVELS.length - 1]}" doit être un projet de référence, digne d'une autorité reconnue dans le domaine.
La difficulté doit croître progressivement et logiquement entre chaque niveau.`,
        schema: projectsResponseSchema,
      },
      {
        storageOptions: { saveMessages: "none" },
      },
    );

    await ctx.runMutation(internal.roadmap.internal.saveRoadmapProjects, {
      roadmapId,
      projects: object.projects.map((project, index) => ({
        ...project,
        level: SKILL_LEVELS[index],
        order: index,
      })),
    });
  },
});

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
