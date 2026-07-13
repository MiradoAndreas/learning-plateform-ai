import { generateText, Output } from "ai";
import { z } from "zod";
import { openai } from "../../../ai";
import type { RoadmapSkeleton } from "./phaseSkeleton";
import type { PhaseDetail } from "./phaseDetails";
import { CORE_PROFESSIONAL_DOMAINS, roadmapTopicEntrySchema } from "./schema";

const gapAdditionSchema = z.object({
  targetPhaseId: z
    .string()
    .describe("L'id de la phase existante où ajouter ces entrées"),
  side: z.enum(["left", "right"]).describe("Colonne où insérer ces entrées"),
  entries: z.array(roadmapTopicEntrySchema).min(1),
  reason: z
    .string()
    .describe(
      "Pourquoi ces sujets manquaient (prérequis oublié, domaine non couvert...)",
    ),
});

const gapAuditSchema = z.object({
  additions: z.array(gapAdditionSchema),
});

export type GapAudit = z.infer<typeof gapAuditSchema>;

function summarizeRoadmap(
  skeleton: RoadmapSkeleton,
  details: Record<string, PhaseDetail>,
) {
  return skeleton.phases
    .map((phase) => {
      const detail = details[phase.id];
      const topics = [
        ...detail.centerNodes.map((n) => n.label),
        ...detail.leftNodes.map((n) => n.label),
        ...detail.rightNodes.map((n) => n.label),
      ];
      return `Phase "${phase.title}" (id: ${phase.id}) — prérequis: [${phase.prerequisites.join(", ") || "aucun"}]\nSujets couverts : ${topics.join(", ")}`;
    })
    .join("\n\n");
}

export async function auditGaps({
  roadmapTopic,
  skeleton,
  details,
}: {
  roadmapTopic: string;
  skeleton: RoadmapSkeleton;
  details: Record<string, PhaseDetail>;
}): Promise<GapAudit> {
  const roadmapSummary = summarizeRoadmap(skeleton, details);

  const { output } = await generateText({
    model: openai("gpt-5-nano"),
    output: Output.object({ schema: gapAuditSchema }),
    prompt: `Tu es un auditeur pédagogique senior. Voici une roadmap complète sur "${roadmapTopic}" :

${roadmapSummary}

Domaines professionnels de référence (vérifie que chacun est bien couvert quelque part, si pertinent pour ce sujet) :
${CORE_PROFESSIONAL_DOMAINS.map((d) => `- ${d}`).join("\n")}

Checklist annoncée par le plan initial : ${skeleton.domainCoverageChecklist.join(", ")}

Ta mission :
1. Identifie les PRÉREQUIS manquants : un sujet avancé mentionné sans que sa base ait été enseignée avant.
2. Identifie les DOMAINES OUBLIÉS : sécurité, tests, performance, architecture, outils, déploiement, monitoring — tout ce qui manque alors que ça devrait être couvert pour ce sujet.
3. Pour chaque manque détecté, propose une addition précise : dans quelle phase existante l'insérer (targetPhaseId), de quel côté (left/right), avec les entrées concrètes à ajouter.

Ne propose PAS d'ajout superflu ou redondant avec l'existant. Ne supprime et ne raccourcis rien — uniquement des ajouts. Si tout est déjà bien couvert pour un domaine, n'ajoute rien pour lui.`,
  });

  return output;
}
