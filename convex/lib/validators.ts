import { v } from "convex/values";

// User status validators
export const userStatus = v.union(
  v.literal("active"),
  v.literal("suspended"),
  v.literal("deleted"),
);

// Learning level validators
export const learningLevel = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
  v.literal("expert"),
);

// Pace validators
export const learningPace = v.union(
  v.literal("relaxed"),
  v.literal("moderate"),
  v.literal("intense"),
);

// Theme validators
export const themePreference = v.union(
  v.literal("light"),
  v.literal("dark"),
  v.literal("system"),
);

// Goal status validators
export const goalStatus = v.union(
  v.literal("not_started"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("paused"),
  v.literal("abandoned"),
);

// Preference category validators
export const preferenceCategory = v.union(
  v.literal("learning_style"),
  v.literal("content_preference"),
  v.literal("interaction_style"),
  v.literal("pace_preference"),
  v.literal("custom"),
);
