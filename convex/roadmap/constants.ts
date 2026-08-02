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

// convex/roadmap/submissions-constants.ts
export const SUBMISSION_PASS_THRESHOLD = 5;

// Budget de caractères par lot envoyé au LLM (≈ 7 500 tokens, marge de sécurité
// large sous la fenêtre de contexte de gpt-4o-mini).
export const BATCH_CHAR_BUDGET = 30_000;

// Plafond par fichier : évite qu'un seul fichier généré (bundle, lockfile
// oublié dans le filtre) ne consomme à lui seul tout un lot.
export const MAX_SINGLE_FILE_CHARS = 20_000;

// Plafond de sécurité anti-abus : au-delà, l'analyse s'arrête et le signale
// explicitement à l'utilisateur plutôt que de continuer indéfiniment.
export const MAX_BATCHES = 25;

const IGNORED_SEGMENTS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  "__pycache__/",
  ".venv/",
  "coverage/",
];

const IGNORED_EXACT_NAMES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "poetry.lock",
];

const TEXT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".java",
  ".go",
  ".rb",
  ".php",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".rs",
  ".swift",
  ".kt",
  ".html",
  ".css",
  ".scss",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".toml",
  ".sql",
  ".sh",
];

export function isRelevantFile(path: string): boolean {
  const lower = path.toLowerCase();
  const baseName = lower.split("/").pop() ?? lower;
  if (IGNORED_SEGMENTS.some((segment) => lower.includes(segment))) return false;
  if (IGNORED_EXACT_NAMES.includes(baseName)) return false;
  return TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
