import type { ActionCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { AI_MODELS } from "../../ai/constants";
import { requireOwnedRoadmapForAction } from "../access";
import { toClientQuiz } from "./model";
import { z } from "zod";
import { QUIZ_QUESTION_COUNT, QUIZ_OPTION_COUNT } from "./constants";

const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(QUIZ_OPTION_COUNT),
        correctIndex: z
          .number()
          .min(0)
          .max(QUIZ_OPTION_COUNT - 1),
      }),
    )
    .length(QUIZ_QUESTION_COUNT),
});

export async function getOrCreateQuiz(
  ctx: ActionCtx,
  {
    roadmapId,
    nodeId,
    nodeLabel,
  }: { roadmapId: Id<"roadmaps">; nodeId: string; nodeLabel: string },
): Promise<{
  quizId: string;
  questions: { question: string; options: string[] }[];
}> {
  const { roadmap } = await requireOwnedRoadmapForAction(ctx, roadmapId);

  const existing = await ctx.runQuery(internal.roadmap.internal.getNodeQuiz, {
    roadmapId,
    nodeId,
  });

  if (existing) {
    return toClientQuiz(existing._id, existing.questions);
  }

  const { object } = await generateObject({
    model: openai.chat(AI_MODELS.review),
    schema: quizSchema,
    prompt: `Génère un quiz de 5 questions à choix multiples (4 options chacune) en français pour valider la compréhension du sujet "${nodeLabel}" dans le contexte de la roadmap "${roadmap.title ?? roadmap.topic}". Niveau débutant à intermédiaire, une seule bonne réponse par question.`,
  });

  const quizId = await ctx.runMutation(internal.roadmap.internal.saveNodeQuiz, {
    roadmapId,
    nodeId,
    questions: object.questions,
  });

  return toClientQuiz(quizId, object.questions);
}
