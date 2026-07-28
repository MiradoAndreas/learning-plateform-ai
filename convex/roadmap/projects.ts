import { defineTable } from "convex/server";
import { v } from "convex/values";

// Doit rester synchronisé manuellement avec SKILL_LEVELS dans
// projects-constants.ts — `v.union` a besoin de littéraux explicites
// pour un typage correct (un spread depuis un tableau perdrait le
// typage littéral côté TypeScript).
export const skillLevelValidator = v.union(
  v.literal("Novice"),
  v.literal("Apprentice"),
  v.literal("Intermediate"),
  v.literal("Competent"),
  v.literal("Advanced"),
  v.literal("Expert"),
  v.literal("Master"),
  v.literal("Authority"),
  v.literal("Legend"),
  v.literal("Grandmaster"),
);

export const roadmapProjects = defineTable({
  roadmapId: v.id("roadmaps"),
  level: skillLevelValidator,
  order: v.number(),
  title: v.string(),
  description: v.string(),
  objectives: v.array(v.string()),
  skillsPracticed: v.array(v.string()),
  estimatedDuration: v.optional(v.string()),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_roadmap_and_order", ["roadmapId", "order"]);
