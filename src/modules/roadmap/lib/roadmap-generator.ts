import { generateText, Output } from "ai";
import { z } from "zod";

import { buildPrompt } from "./prompt-builder";
import { openai } from "../../../../ai";
import { buildQuestionsPrompt } from "./prompt-question-builder";
const roadmapSchema = z.object({
  title: z.string(),
  summary: z.string(),
  mermaid: z.string(),
});

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

type GenerateQuestionsInput = {
  topic: string;
};

type Answer = {
  key: string;
  value: string;
};

type GenerateRoadmapInput = {
  topic: string;
  answers: Answer[];
};

export async function generateRoadmap({ topic }: GenerateRoadmapInput) {
  const prompt = buildPrompt(topic);

  const { output } = await generateText({
    model: openai("gpt-5-nano"),
    output: Output.object({
      schema: roadmapSchema,
    }),
    prompt,
  });

  return output;
}

export async function generateQuestions({ topic }: GenerateQuestionsInput) {
  const prompt = buildQuestionsPrompt(topic);

  const { output } = await generateText({
    model: openai("gpt-5-nano"),
    output: Output.object({
      schema: questionsSchema,
    }),
    prompt,
  });

  return output;
}
