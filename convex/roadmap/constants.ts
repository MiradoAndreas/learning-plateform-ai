export const LEARNING_RESOURCE_QUESTION_KEY = "preferred_learning_resource";

export const LEARNING_RESOURCE_OPTIONS = {
  YOUTUBE: "Vidéos YouTube",
  ARTICLES: "Articles écrits",
  OFFICIAL_DOCS: "Documentation officielle",
  BOOKS: "Livres",
  INTERACTIVE: "Tutoriels interactifs",
  PROJECT_BASED: "Apprentissage par projets",
} as const;

export const LEARNING_RESOURCE_QUESTION = {
  key: LEARNING_RESOURCE_QUESTION_KEY,
  title: "Quel type de ressource préférez-vous pour apprendre ?",
  description:
    "Votre tuteur IA adaptera ses recommandations selon ce choix (vidéos, articles, documentation...).",
  required: true,
  options: Object.values(LEARNING_RESOURCE_OPTIONS),
};

export const SKILL_LEVELS = [
  "Novice",
  "Apprentice",
  "Intermediate",
  "Competent",
  "Advanced",
  "Expert",
  "Master",
  "Authority",
  "Legend",
  "Grandmaster",
] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];
