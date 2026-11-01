import type { ActionCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { learningAgent } from "../../agents/learning";
import { requireOwnedRoadmapForAction } from "../access";
import { z } from "zod";
import { SKILL_LEVELS } from "./constants";

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  objectives: z.array(z.string()).min(2).max(5),
  skillsPracticed: z.array(z.string()).min(1).max(5),
  estimatedDuration: z.string(),
});

const projectsResponseSchema = z.object({
  projects: z.array(projectSchema).length(SKILL_LEVELS.length),
});

export async function generateProjects(
  ctx: ActionCtx,
  { roadmapId }: { roadmapId: Id<"roadmaps"> },
): Promise<void> {
  const { identity, roadmap } = await requireOwnedRoadmapForAction(
    ctx,
    roadmapId,
  );

  // Idempotence : évite une double génération si le hook se déclenche
  // deux fois (StrictMode en dev, ou deux onglets ouverts sur la même
  // roadmap au même moment).
  const existing = await ctx.runQuery(
    internal.roadmap.internal.getRoadmapProjectsInternal,
    { roadmapId },
  );
  if (existing.length > 0) return;

  // Thread jetable : pas lié à roadmapThreads, rien à conserver.
  const { thread } = await learningAgent.createThread(ctx, {
    userId: identity.subject,
  });

  const { object } = await thread.generateObject(
    {
      prompt: `Tu es un concepteur pédagogique expert. Pour le domaine d'apprentissage suivant : "${roadmap.title ?? roadmap.topic}" (sujet : "${roadmap.topic}"), génère exactement ${SKILL_LEVELS.length} projets pratiques en français, un par niveau de compétence, dans cet ordre croissant de difficulté : ${SKILL_LEVELS.join(", ")}.

Chaque projet doit :
- avoir un titre court et concret
- avoir une description claire de 2 à 4 phrases expliquant ce que l'utilisateur va construire
- lister entre 2 et 5 objectifs pédagogiques précis
- lister les compétences pratiquées
- indiquer une durée estimée réaliste (ex: "2-3 heures", "1 semaine")

Le niveau "${SKILL_LEVELS[0]}" doit être accessible à un débutant complet, sans aucun prérequis.
Le niveau "${SKILL_LEVELS[SKILL_LEVELS.length - 1]}" doit être un projet de référence, digne d'une autorité reconnue dans le domaine.
La difficulté doit croître progressivement et logiquement entre chaque niveau.`,
      schema: projectsResponseSchema,
    },
    {
      storageOptions: { saveMessages: "none" },
    },
  );

  await ctx.runMutation(internal.roadmap.internal.saveRoadmapProjects, {
    roadmapId,
    projects: object.projects.map((project, index) => ({
      ...project,
      level: SKILL_LEVELS[index],
      order: index,
    })),
  });
}
