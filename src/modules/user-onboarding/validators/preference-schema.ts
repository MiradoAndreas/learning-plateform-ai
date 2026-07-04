import { z } from "zod";

export const preferenceItemSchema = z.object({
  key: z.string(),
  value: z.union([z.boolean(), z.string()]),
  category: z.enum([
    "learning_style",
    "content_preference",
    "interaction_style",
    "pace_preference",
  ]),
  label: z.string(),
});

export const preferencesSchema = z.object({
  preferences: z.array(preferenceItemSchema),
});

export type PreferenceItemSchema = z.infer<typeof preferenceItemSchema>;
export type PreferencesSchema = z.infer<typeof preferencesSchema>;

// Pre-defined preference options
export const PREFERENCE_OPTIONS = [
  // Learning Style
  {
    key: "likes_analogies",
    label: "Aime les analogies",
    category: "learning_style" as const,
    defaultValue: true,
  },
  {
    key: "likes_examples",
    label: "Aime les exemples",
    category: "learning_style" as const,
    defaultValue: true,
  },
  {
    key: "likes_visual_explanations",
    label: "Aime les explications visuelles",
    category: "learning_style" as const,
    defaultValue: true,
  },
  {
    key: "likes_diagrams",
    label: "Aime les diagrammes",
    category: "learning_style" as const,
    defaultValue: true,
  },

  // Content Preference
  {
    key: "likes_code_examples",
    label: "Aime les exemples de code",
    category: "content_preference" as const,
    defaultValue: true,
  },
  {
    key: "likes_exercises",
    label: "Aime les exercices",
    category: "content_preference" as const,
    defaultValue: true,
  },
  {
    key: "likes_quizzes",
    label: "Aime les quiz",
    category: "content_preference" as const,
    defaultValue: true,
  },
  {
    key: "likes_project_based",
    label: "Aime l'apprentissage par projet",
    category: "content_preference" as const,
    defaultValue: true,
  },

  // Interaction Style
  {
    key: "prefers_concise_explanations",
    label: "Préfère les explications concises",
    category: "interaction_style" as const,
    defaultValue: false,
  },
  {
    key: "prefers_detailed_explanations",
    label: "Préfère les explications détaillées",
    category: "interaction_style" as const,
    defaultValue: true,
  },
  {
    key: "prefers_theory_first",
    label: "Préfère la théorie d'abord",
    category: "interaction_style" as const,
    defaultValue: false,
  },
  {
    key: "prefers_practice_first",
    label: "Préfère la pratique d'abord",
    category: "interaction_style" as const,
    defaultValue: true,
  },

  // Pace Preference
  {
    key: "prefers_step_by_step",
    label: "Préfère le pas-à-pas",
    category: "pace_preference" as const,
    defaultValue: true,
  },
  {
    key: "prefers_rapid_pace",
    label: "Préfère un rythme rapide",
    category: "pace_preference" as const,
    defaultValue: false,
  },
  {
    key: "prefers_self_paced",
    label: "Préfère l'apprentissage à son propre rythme",
    category: "pace_preference" as const,
    defaultValue: true,
  },
  {
    key: "prefers_structured_curriculum",
    label: "Préfère un programme structuré",
    category: "pace_preference" as const,
    defaultValue: true,
  },
] as const;

export interface PreferenceOption {
  key: string;
  label: string;
  category:
    | "learning_style"
    | "content_preference"
    | "interaction_style"
    | "pace_preference";
  defaultValue: boolean | string;
}
