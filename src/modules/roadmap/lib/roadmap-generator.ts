import { generateText, Output } from "ai";
import { z } from "zod";
// todos: remove the file prompt-builder.ts if we don't need it

import { buildQuestionsPrompt } from "./prompt-question-builder";
import { openai } from "../../../../ai";
import {
  generatePhaseSkeleton,
  generatePhaseDetails,
  auditGaps,
  addChoices,
} from "../../../../convex/roadmap/generation/stages";
import type { PhaseDetail } from "../../../../convex/roadmap/generation/schemas";
import { mergeRoadmap } from "../../../../convex/roadmap/generation/merge";

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

export async function generateRoadmap({
  topic,
  answers,
}: {
  topic: string;
  answers: { key: string; value: string }[];
}) {
  const skeleton = await generatePhaseSkeleton({
    topic,
    // todos: fix the error of type later
    answers,
  });
  console.log("Skeleton : ", skeleton);
  const detailsArray = await Promise.all(
    skeleton.phases.map((phase) =>
      generatePhaseDetails({
        roadmapTopic: topic,
        skeleton: skeleton,
        phase: phase,
      }),
    ),
  );
  const detailsRecord = skeleton.phases.reduce(
    (acc, phase, index) => {
      acc[phase.id] = detailsArray[index];
      return acc;
    },
    {} as Record<string, PhaseDetail>,
  );
  console.log("Details : ", detailsRecord);
  // 3. Appeler auditGaps avec le bon format
  const gapAudit = await auditGaps({
    roadmapTopic: topic,
    skeleton: skeleton,
    details: detailsRecord, // <- C'est un Record<string, PhaseDetail>
  });
  console.log("Gap Audit : ", gapAudit);

  const choicePass = await addChoices({
    roadmapTopic: topic, // Le sujet de la roadmap
    skeleton: skeleton, // Le squelette complet
    details: detailsRecord, // Les détails (Record<string, PhaseDetail>)
  });
  console.log("Choice Pass : ", choicePass);
  const roadmapData = mergeRoadmap({
    skeleton: skeleton, // Le squelette complet
    details: detailsRecord, // Les détails indexés par phaseId
    gapAudit: gapAudit, // L'audit des gaps
    choicePass: choicePass, // Les choix à appliquer
  });

  console.log("Roadmap Data : ", roadmapData);

  return {
    title: skeleton.title,
    summary: "Summary for later",
    roadmapData,
  };
}

export async function generateQuestions({ topic }: { topic: string }) {
  const prompt = buildQuestionsPrompt(topic);

  const { output } = await generateText({
    model: openai("gpt-5-nano"),
    output: Output.object({ schema: questionsSchema }),
    prompt,
  });

  return output;
}
