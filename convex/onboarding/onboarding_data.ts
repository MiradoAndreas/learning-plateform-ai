import { defineTable } from "convex/server";
import { v } from "convex/values";

export const onboardingData = defineTable({
  userId: v.string(),

  // Learning goals summary
  primaryGoal: v.string(),
  secondaryGoals: v.optional(v.array(v.string())),

  // Current level assessment
  currentLevel: v.union(
    v.literal("beginner"),
    v.literal("intermediate"),
    v.literal("advanced"),
    v.literal("expert"),
  ),

  // Time commitment
  studyDaysPerWeek: v.number(), // 1 à 7
  hoursPerStudyDay: v.number(), // .5 à 8
  preferredPace: v.union(
    v.literal("relaxed"),
    v.literal("moderate"),
    v.literal("intense"),
  ),

  // Target dates
  targetCompletionDate: v.optional(v.number()),
  startDate: v.number(),

  // References to related data
  learningGoalIds: v.optional(v.array(v.id("learning_goals"))),
  interestIds: v.optional(v.array(v.id("interests"))),
  preferenceIds: v.optional(v.array(v.id("learning_preferences"))),

  // Metadata
  version: v.number(),
  completedAt: v.optional(v.number()),
  lastUpdatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_user_and_status", ["userId", "completedAt"]);
