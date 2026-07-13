import { generateText, Output } from "ai";
import { z } from "zod";
// todos: remove the file prompt-builder.ts if we don't need it

import { buildQuestionsPrompt } from "./prompt-question-builder";
import { openai } from "../../../../ai";
import { generatePhaseSkeleton } from "../../../../convex/roadmap/generation/phaseSkeleton";
import { auditGaps } from "../../../../convex/roadmap/generation/gapAudit";
import {
  generatePhaseDetails,
  PhaseDetail,
} from "../../../../convex/roadmap/generation/phaseDetails";
import { addChoices } from "../../../../convex/roadmap/generation/choicePass";
import { mergeRoadmap } from "../../../../convex/roadmap/generation/merge";

// const recommendationEnum = z.enum(["recommended", "alternative", "none"]);

// const roadmapOptionSchema = z.object({
//   id: z.string().describe("Identifiant unique en kebab-case"),
//   label: z.string().describe("Nom court de l'option, ex: 'React'"),
//   recommendation: recommendationEnum.describe(
//     "'recommended' pour LE meilleur choix actuel (une seule option par choix), 'alternative' pour un bon second choix, 'none' pour les autres options",
//   ),
//   note: z
//     .string()
//     .optional()
//     .describe(
//       "Courte justification, ex: 'Recommandé en 2026 pour son écosystème'",
//     ),
// });

// const roadmapTopicEntrySchema = z.object({
//   kind: z.literal("topic"),
//   id: z.string().describe("Identifiant unique en kebab-case"),
//   label: z.string().describe("Le nom du sujet, court (2-4 mots)"),
// });

// const roadmapChoiceEntrySchema = z.object({
//   kind: z.literal("choice"),
//   id: z.string().describe("Identifiant unique en kebab-case"),
//   label: z
//     .string()
//     .describe(
//       "La question de choix posée à l'utilisateur, ex: 'Choisissez votre spécialisation'",
//     ),
//   options: z
//     .array(roadmapOptionSchema)
//     .min(2)
//     .max(6)
//     .describe("Les options concurrentes pour ce choix"),
// });

// const roadmapEntrySchema = z.discriminatedUnion("kind", [
//   roadmapTopicEntrySchema,
//   roadmapChoiceEntrySchema,
// ]);

// const roadmapCenterNodeSchema = z.object({
//   id: z.string(),
//   label: z.string(),
// });

// const roadmapSectionSchema = z.object({
//   id: z.string(),
//   title: z.string(),
//   centerNodes: z.array(roadmapCenterNodeSchema).min(1).max(2),
//   leftNodes: z.array(roadmapEntrySchema).min(2).max(8),
//   rightNodes: z.array(roadmapEntrySchema).min(2).max(8),
// });

// const roadmapDataSchema = z.object({
//   title: z.string(),
//   sections: z.array(roadmapSectionSchema).min(3).max(8),
// });

// const roadmapSchema = z.object({
//   title: z.string(),
//   summary: z.string(),
//   roadmapData: roadmapDataSchema,
// });

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
