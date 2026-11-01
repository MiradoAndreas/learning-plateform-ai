import { v } from "convex/values";

export const userStatusValidator = v.union(
  v.literal("active"),
  v.literal("suspended"),
  v.literal("deleted"),
);
export const themePreferenceValidator = v.union(
  v.literal("light"),
  v.literal("dark"),
  v.literal("system"),
);
