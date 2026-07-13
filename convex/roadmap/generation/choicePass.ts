import { generateText, Output } from "ai";
import { z } from "zod";
import { openai } from "../../../ai";
import type { RoadmapSkeleton } from "./phaseSkeleton";
import type { PhaseDetail } from "./phaseDetails";
import { roadmapOptionSchema } from "./schema";

const choiceReplacementSchema = z.object({
  entryId: z
    .string()
    .describe("L'id exact de l'entrée topic existante à convertir en choice"),
  label: z
    .string()
    .describe("La question de choix, ex: 'Choisissez votre spécialisation'"),
  options: z.array(roadmapOptionSchema).min(2).max(6),
});

const choicePassSchema = z.object({
  replacements: z.array(choiceReplacementSchema),
});

export type ChoicePass = z.infer<typeof choicePassSchema>;

function listAllEntryIds(
  skeleton: RoadmapSkeleton,
  details: Record<string, PhaseDetail>,
) {
  return skeleton.phases.flatMap((phase) => {
    const detail = details[phase.id];
    return [...detail.leftNodes, ...detail.rightNodes].map(
      (entry) => `${entry.id}: "${entry.label}" (phase: ${phase.title})`,
    );
  });
}

export async function addChoices({
  roadmapTopic,
  skeleton,
  details,
}: {
  roadmapTopic: string;
  skeleton: RoadmapSkeleton;
  details: Record<string, PhaseDetail>;
}): Promise<ChoicePass> {
  const allEntries = listAllEntryIds(skeleton, details);

  const { output } = await generateText({
    model: openai("gpt-5-nano"),
    output: Output.object({ schema: choicePassSchema }),
    prompt: `Voici tous les sujets d'une roadmap sur "${roadmapTopic}" :

${allEntries.join("\n")}

Identifie UNIQUEMENT les sujets qui représentent un vrai dilemme technologique avec plusieurs approches concurrentes valables (ex: un sujet "Framework Frontend" pourrait devenir un choix entre React/Vue/Angular/Svelte/Solid).

Pour chaque sujet identifié, propose son remplacement par un choix ("replacements") :
- entryId : l'id EXACT du sujet à remplacer (copie-le tel quel depuis la liste ci-dessus).
- label : la question posée à l'utilisateur.
- options : 2 à 6 options concrètes, avec EXACTEMENT une marquée "recommended" (le meilleur choix actuel, en 2026, avec une note justificative courte), optionnellement une en "alternative", les autres en "none".

N'en propose que pour les VRAIS dilemmes — la majorité des sujets doivent rester des topics simples.`,
  });

  return output;
}
