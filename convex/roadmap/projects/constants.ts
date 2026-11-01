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
