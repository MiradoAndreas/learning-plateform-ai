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

export const roadmapChoiceEntrySchema = z.object({
  kind: z.literal("choice"),
  id: z.string(),
  label: z
    .string()
    .describe("La question de choix, ex: 'Choisissez votre spécialisation'"),
  options: z.array(roadmapOptionSchema).min(2).max(6),
});

export const roadmapEntrySchema = z.discriminatedUnion("kind", [
  roadmapTopicEntrySchema,
  roadmapChoiceEntrySchema,
]);

export const roadmapCenterNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

// Domaines qu'une roadmap professionnelle complète doit couvrir.
// Utilisé à la fois pour guider la génération initiale ET pour l'audit final.
export const CORE_PROFESSIONAL_DOMAINS = [
  "Fonctionnement d'Internet et du Web (HTTP, DNS, navigateurs)",
  "Git et outils de développement",
  "TypeScript / typage statique",
  "Architecture logicielle (frontend et backend)",
  "Authentification et sécurité (OWASP, gestion des sessions, CORS)",
  "Bases de données et optimisation (indexation, requêtes N+1)",
  "ORM / accès aux données",
  "Tests (unitaires, intégration, end-to-end)",
  "Cache et stratégies de performance",
  "Conteneurisation (Docker)",
  "CI/CD et automatisation",
  "Déploiement et hébergement",
  "Monitoring, logs et observabilité",
  "Cloud (concepts de base, scalabilité)",
  "Bonnes pratiques et standards de l'industrie",
] as const;
