import { generateText, Output } from "ai";
import type { z } from "zod";
import { openai } from "../../ai/provider";
import { AI_MODELS } from "../../ai/constants";
import {
  roadmapSkeletonSchema,
  phaseDetailSchema,
  gapAuditSchema,
  choicePassSchema,
  type SkeletonInput,
  type PhaseDetailsInput,
  type GenerationContext,
} from "./schemas";
import {
  buildSkeletonPrompt,
  buildDetailsPrompt,
  buildGapAuditPrompt,
  buildChoicesPrompt,
} from "./prompts";

// Every generation stage uses the same provider, model and structured-output setup.
async function generateStage<T>(schema: z.ZodType<T>, prompt: string) {
  const { output } = await generateText({
    model: openai(AI_MODELS.generation),
    output: Output.object({ schema }),
    prompt,
  });
  return output;
}

export function generatePhaseSkeleton(input: SkeletonInput) {
  return generateStage(roadmapSkeletonSchema, buildSkeletonPrompt(input));
}
export function generatePhaseDetails(input: PhaseDetailsInput) {
  return generateStage(phaseDetailSchema, buildDetailsPrompt(input));
}
export function auditGaps(input: GenerationContext) {
  return generateStage(gapAuditSchema, buildGapAuditPrompt(input));
}
export function addChoices(input: GenerationContext) {
  return generateStage(choicePassSchema, buildChoicesPrompt(input));
}
