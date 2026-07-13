import { generateText, Output } from "ai";
import { z } from "zod";
import { openai } from "../../../ai";
import { CORE_PROFESSIONAL_DOMAINS } from "./schema";

const phaseSkeletonSchema = z.object({
  id: z
    .string()
    .describe("Identifiant unique en kebab-case, ex: 'fondamentaux-web'"),
  title: z.string().describe("Titre de la phase, ex: 'Fondamentaux Web'"),
  goal: z
    .string()
    .describe("Ce que l'apprenant doit maîtriser à la fin de cette phase"),
  prerequisites: z
    .array(z.string())
    .describe(
      "Ids des phases précédentes qui sont un prérequis direct pour celle-ci",
    ),
});

export const roadmapSkeletonSchema = z.object({
  title: z.string(),
  domainCoverageChecklist: z
    .array(z.string())
    .describe(
      "Les grands domaines professionnels que CETTE roadmap doit couvrir vu son sujet",
    ),
  phases: z
    .array(phaseSkeletonSchema)
    .min(6)
    .max(16)
    .describe(
      "Les grandes phases chronologiques d'apprentissage, dans l'ordre",
    ),
});

export type RoadmapSkeleton = z.infer<typeof roadmapSkeletonSchema>;

export async function generatePhaseSkeleton({
  topic,
  answers,
}: {
  topic: string;
  answers: { key: string; value: string }[];
}): Promise<RoadmapSkeleton> {
  const answersBlock = answers.length
    ? `Réponses de l'utilisateur au questionnaire :\n${answers
        .map((a) => `- ${a.key}: ${a.value}`)
        .join("\n")}`
    : "Aucune réponse fournie, cible un public débutant.";

  const { output } = await generateText({
    model: openai("gpt-5-nano"),
    output: Output.object({ schema: roadmapSkeletonSchema }),
    prompt: `Tu es un architecte pédagogique senior. Découpe l'apprentissage du sujet "${topic}" en grandes phases chronologiques COMPLÈTES et PROFESSIONNELLES.

${answersBlock}

Exigences impératives :
- Ne cherche JAMAIS à raccourcir. Priorise l'exhaustivité et la rigueur pédagogique sur la concision.
- Inclue TOUS les domaines pertinents pour ce sujet, y compris ceux souvent oubliés : sécurité, architecture, tests, performance, outils, déploiement, monitoring.
- Voici une liste de référence de domaines professionnels courants (adapte selon la pertinence pour "${topic}", ignore ceux non pertinents, mais n'en invente pas l'absence par facilité) :
${CORE_PROFESSIONAL_DOMAINS.map((d) => `  - ${d}`).join("\n")}
- Chaque phase doit lister ses prérequis (ids d'autres phases) pour garantir un ordre logique.
- Remplis "domainCoverageChecklist" avec la liste des domaines que TA roadmap va effectivement couvrir — elle servira de checklist de vérification plus tard, donc sois précis et complet.`,
  });

  return output;
}
