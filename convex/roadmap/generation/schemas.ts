import { z } from "zod";

export const recommendationEnum = z.enum([
  "recommended",
  "alternative",
  "none",
]);

export const roadmapOptionSchema = z.object({
  id: z.string().describe("Identifiant unique en kebab-case"),
  label: z.string().describe("Nom court de l'option, ex: 'React'"),
  recommendation: recommendationEnum,
  note: z.string().nullable(),
});

export const roadmapTopicEntrySchema = z.object({
  kind: z.literal("topic"),
  id: z.string().describe("Identifiant unique en kebab-case"),
  label: z.string().describe("Le nom du sujet, court (2-4 mots)"),
});

export const roadmapCenterNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const phaseSkeletonSchema = z.object({
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

const phaseTopicsSchema = z.array(roadmapTopicEntrySchema).min(3).max(12);

export const phaseDetailSchema = z.object({
  centerNodes: z.array(roadmapCenterNodeSchema).min(1).max(3),
  leftNodes: phaseTopicsSchema,
  rightNodes: phaseTopicsSchema,
});

export const gapAdditionSchema = z.object({
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

export const gapAuditSchema = z.object({
  additions: z.array(gapAdditionSchema),
});

export const choiceReplacementSchema = z.object({
  entryId: z
    .string()
    .describe("L'id exact de l'entrée topic existante à convertir en choice"),
  label: z
    .string()
    .describe("La question de choix, ex: 'Choisissez votre spécialisation'"),
  options: z.array(roadmapOptionSchema).min(2).max(6),
});

export const choicePassSchema = z.object({
  replacements: z.array(choiceReplacementSchema),
});

export type RoadmapSkeleton = z.infer<typeof roadmapSkeletonSchema>;
export type PhaseDetail = z.infer<typeof phaseDetailSchema>;
export type GapAudit = z.infer<typeof gapAuditSchema>;
export type ChoicePass = z.infer<typeof choicePassSchema>;

export type SkeletonInput = {
  topic: string;
  answers: { key: string; value: string }[];
};
export type PhaseDetailsInput = {
  roadmapTopic: string;
  skeleton: RoadmapSkeleton;
  phase: RoadmapSkeleton["phases"][number];
};
export type GenerationContext = {
  roadmapTopic: string;
  skeleton: RoadmapSkeleton;
  details: Record<string, PhaseDetail>;
};
