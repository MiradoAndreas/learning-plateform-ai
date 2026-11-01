import {
  generatePhaseSkeleton,
  generatePhaseDetails,
  auditGaps,
  addChoices,
} from "./stages";
import type { PhaseDetail } from "./schemas";
import { mergeRoadmap } from "./merge";

export async function generateRoadmap({
  topic,
  answers,
}: {
  topic: string;
  answers?: { key: string; value: string }[];
}) {
  const resolvedAnswers = answers ?? [];

  // Étape 1 : squelette des grandes phases + checklist de domaines.
  const skeleton = await generatePhaseSkeleton({
    topic,
    answers: resolvedAnswers,
  });

  console.log("Skeleton : ", skeleton);

  // Étape 2 : détail de chaque phase, en parallèle (indépendantes entre elles).
  const detailResults = await Promise.all(
    skeleton.phases.map((phase) =>
      generatePhaseDetails({ roadmapTopic: topic, skeleton, phase }).then(
        (detail): [string, PhaseDetail] => [phase.id, detail],
      ),
    ),
  );
  const details = Object.fromEntries(detailResults);
  console.log("details", details);

  // Étape 3+4 : audit des prérequis manquants et des domaines oubliés.
  const gapAudit = await auditGaps({ roadmapTopic: topic, skeleton, details });
  console.log("gapAudit", gapAudit);

  // Étape 5 : identification des dilemmes technologiques (choice).
  const choicePass = await addChoices({
    roadmapTopic: topic,
    skeleton,
    details,
  });
  console.log("choicePass", choicePass);

  // Étape 6 : fusion pure, sans appel LLM.
  const roadmapData = mergeRoadmap({ skeleton, details, gapAudit, choicePass });

  console.log("roadmapData", roadmapData);

  // Résumé pour l'affichage (titre/summary de la fiche roadmap).
  const summary = `Roadmap complète couvrant ${skeleton.phases.length} phases : ${skeleton.domainCoverageChecklist.join(", ")}.`;
  console.log("summary", summary);

  return { title: skeleton.title, summary, roadmapData };
}
