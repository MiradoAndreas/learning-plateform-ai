import { defineTable } from "convex/server";
import { v } from "convex/values";

export const learningGoals = defineTable({
  userId: v.string(),

  // Goal hierarchy
  goalType: v.union(
    v.literal("skill_development"),
    v.literal("career_transition"),
    v.literal("certification"),
    v.literal("personal_interest"),
    v.literal("project_based"),
  ),

  title: v.string(),
  description: v.optional(v.string()),

  // Measurable outcomes
  targetOutcomes: v.optional(v.array(v.string())),

  // Timeline
  targetDate: v.optional(v.number()),
  priority: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("critical"),
  ),

  // Progress tracking
  progress: v.optional(v.number()),
  status: v.union(
    v.literal("not_started"),
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("paused"),
    v.literal("abandoned"),
  ),

  // Metadata
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_user_and_status", ["userId", "status"])
  .index("by_user_and_priority", ["userId", "priority"]);
