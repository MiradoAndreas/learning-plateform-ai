import { generateText, Output } from "ai";
import { z } from "zod";
// todos: remove the file prompt-builder.ts if we don't need it

import { buildQuestionsPrompt } from "./prompt-question-builder";
import { gateway } from "../../../../ai";
import { AI_MODELS } from "../../../../convex/ai/constants";
// Keep the historical helper on the same implementation as the Convex action.
export { generateRoadmap } from "../../../../convex/roadmap/generation/pipeline";

const questionSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string(),
  required: z.boolean(),
  options: z.array(z.string()),
});

const questionsSchema = z.object({
  questions: z.array(questionSchema),
});

export async function generateQuestions({ topic }: { topic: string }) {
  const prompt = buildQuestionsPrompt(topic);

  const { output } = await generateText({
    model: gateway(AI_MODELS.generation),
    output: Output.object({ schema: questionsSchema }),
    prompt,
  });

  return output;
}
