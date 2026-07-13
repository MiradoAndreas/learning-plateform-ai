import { generateText, Output } from "ai";
import { z } from "zod";
import { openai } from "../../../ai";
import type { RoadmapSkeleton } from "./phaseSkeleton";
import { roadmapCenterNodeSchema, roadmapTopicEntrySchema } from "./schema";

// À cette étape, on ne génère que des "topic" — la conversion en "choice"
// se fait dans une passe dédiée sur l'ensemble de la roadmap (étape 4),
// pour avoir une vue globale cohérente des dilemmes technologiques.
const phaseDetailSchema = z.object({
  centerNodes: z.array(roadmapCenterNodeSchema).min(1).max(3),
  leftNodes: z.array(roadmapTopicEntrySchema).min(3).max(12),
  rightNodes: z.array(roadmapTopicEntrySchema).min(3).max(12),
});

export type PhaseDetail = z.infer<typeof phaseDetailSchema>;

export async function generatePhaseDetails({
  roadmapTopic,
  skeleton,
  phase,
}: {
  roadmapTopic: string;
  skeleton: RoadmapSkeleton;
  phase: RoadmapSkeleton["phases"][number];
}): Promise<PhaseDetail> {
  const allPhaseTitles = skeleton.phases.map((p) => `- ${p.title}`).join("\n");

  const { output } = await generateText({
    model: openai("gpt-5-nano"),
    output: Output.object({ schema: phaseDetailSchema }),
    prompt: `Tu génères le contenu détaillé d'UNE phase d'une roadmap d'apprentissage sur "${roadmapTopic}".

Phase actuelle : "${phase.title}"
Objectif de cette phase : ${phase.goal}

Vue d'ensemble de TOUTES les phases de la roadmap (pour éviter les doublons et rester cohérent) :
${allPhaseTitles}

Génère :
- centerNodes (1 à 3) : les concepts MAJEURS de cette phase, ceux qui structurent tout le reste.
- leftNodes et rightNodes (3 à 12 chacun) : tous les sujets détaillés nécessaires pour maîtriser cette phase. Sois exhaustif — n'omets aucun sujet important pour économiser de la place. Inclue les fondamentaux ET les bonnes pratiques associées à cette phase (pas seulement la théorie).

Ne génère que des entrées de type "topic" (kind: "topic") à ce stade.`,
  });

  return output;
}
