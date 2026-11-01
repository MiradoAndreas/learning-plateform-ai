import { v } from "convex/values";
import { SKILL_LEVELS } from "./constants";

export const skillLevelValidator = v.union(
  ...SKILL_LEVELS.map((level) => v.literal(level)),
);

export const projectFields = {
  level: skillLevelValidator,
  order: v.number(),
  title: v.string(),
  description: v.string(),
  objectives: v.array(v.string()),
  skillsPracticed: v.array(v.string()),
  estimatedDuration: v.optional(v.string()),
};
