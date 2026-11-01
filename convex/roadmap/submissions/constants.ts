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

export const IGNORED_SEGMENTS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  "__pycache__/",
  ".venv/",
  "coverage/",
];

export const IGNORED_EXACT_NAMES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "poetry.lock",
];

export const TEXT_EXTENSIONS = [
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
