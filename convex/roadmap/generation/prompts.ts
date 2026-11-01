import { CORE_PROFESSIONAL_DOMAINS } from "./constants";
import type {
  RoadmapSkeleton,
  PhaseDetail,
  SkeletonInput,
  PhaseDetailsInput,
  GenerationContext,
} from "./schemas";

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

export function buildSkeletonPrompt({ topic, answers }: SkeletonInput) {
  const answersBlock = answers.length
    ? `Réponses de l'utilisateur au questionnaire :\n${answers
        .map((a) => `- ${a.key}: ${a.value}`)
        .join("\n")}`
    : "Aucune réponse fournie, cible un public débutant.";
  return `Tu es un architecte pédagogique senior. Découpe l'apprentissage du sujet "${topic}" en grandes phases chronologiques COMPLÈTES et PROFESSIONNELLES.

${answersBlock}

Exigences impératives :
- Ne cherche JAMAIS à raccourcir. Priorise l'exhaustivité et la rigueur pédagogique sur la concision.
- Inclue TOUS les domaines pertinents pour ce sujet, y compris ceux souvent oubliés : sécurité, architecture, tests, performance, outils, déploiement, monitoring.
- Voici une liste de référence de domaines professionnels courants (adapte selon la pertinence pour "${topic}", ignore ceux non pertinents, mais n'en invente pas l'absence par facilité) :
${CORE_PROFESSIONAL_DOMAINS.map((d) => `  - ${d}`).join("\n")}
- Chaque phase doit lister ses prérequis (ids d'autres phases) pour garantir un ordre logique.
- Remplis "domainCoverageChecklist" avec la liste des domaines que TA roadmap va effectivement couvrir — elle servira de checklist de vérification plus tard, donc sois précis et complet.`;
}

export function buildDetailsPrompt({
  roadmapTopic,
  skeleton,
  phase,
}: PhaseDetailsInput) {
  const allPhaseTitles = skeleton.phases.map((p) => `- ${p.title}`).join("\n");
  return `Tu génères le contenu détaillé d'UNE phase d'une roadmap d'apprentissage sur "${roadmapTopic}".

Phase actuelle : "${phase.title}"
Objectif de cette phase : ${phase.goal}

Vue d'ensemble de TOUTES les phases de la roadmap (pour éviter les doublons et rester cohérent) :
${allPhaseTitles}

Génère :
- centerNodes (1 à 3) : les concepts MAJEURS de cette phase, ceux qui structurent tout le reste.
- leftNodes et rightNodes (3 à 12 chacun) : tous les sujets détaillés nécessaires pour maîtriser cette phase. Sois exhaustif — n'omets aucun sujet important pour économiser de la place. Inclue les fondamentaux ET les bonnes pratiques associées à cette phase (pas seulement la théorie).

Ne génère que des entrées de type "topic" (kind: "topic") à ce stade.`;
}

export function buildGapAuditPrompt({
  roadmapTopic,
  skeleton,
  details,
}: GenerationContext) {
  const roadmapSummary = summarizeRoadmap(skeleton, details);
  return `Tu es un auditeur pédagogique senior. Voici une roadmap complète sur "${roadmapTopic}" :

${roadmapSummary}

Domaines professionnels de référence (vérifie que chacun est bien couvert quelque part, si pertinent pour ce sujet) :
${CORE_PROFESSIONAL_DOMAINS.map((d) => `- ${d}`).join("\n")}

Checklist annoncée par le plan initial : ${skeleton.domainCoverageChecklist.join(", ")}

Ta mission :
1. Identifie les PRÉREQUIS manquants : un sujet avancé mentionné sans que sa base ait été enseignée avant.
2. Identifie les DOMAINES OUBLIÉS : sécurité, tests, performance, architecture, outils, déploiement, monitoring — tout ce qui manque alors que ça devrait être couvert pour ce sujet.
3. Pour chaque manque détecté, propose une addition précise : dans quelle phase existante l'insérer (targetPhaseId), de quel côté (left/right), avec les entrées concrètes à ajouter.

Ne propose PAS d'ajout superflu ou redondant avec l'existant. Ne supprime et ne raccourcis rien — uniquement des ajouts. Si tout est déjà bien couvert pour un domaine, n'ajoute rien pour lui.`;
}

export function buildChoicesPrompt({
  roadmapTopic,
  skeleton,
  details,
}: GenerationContext) {
  const allEntries = listAllEntryIds(skeleton, details);
  return `Voici tous les sujets d'une roadmap sur "${roadmapTopic}" :

${allEntries.join("\n")}

Identifie UNIQUEMENT les sujets qui représentent un vrai dilemme technologique avec plusieurs approches concurrentes valables (ex: un sujet "Framework Frontend" pourrait devenir un choix entre React/Vue/Angular/Svelte/Solid).

Pour chaque sujet identifié, propose son remplacement par un choix ("replacements") :
- entryId : l'id EXACT du sujet à remplacer (copie-le tel quel depuis la liste ci-dessus).
- label : la question posée à l'utilisateur.
- options : 2 à 6 options concrètes, avec EXACTEMENT une marquée "recommended" (le meilleur choix actuel, en 2026, avec une note justificative courte), optionnellement une en "alternative", les autres en "none".

N'en propose que pour les VRAIS dilemmes — la majorité des sujets doivent rester des topics simples.`;
}
