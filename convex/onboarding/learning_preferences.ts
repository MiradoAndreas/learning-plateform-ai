import { defineTable } from "convex/server";
import { v } from "convex/values";

export const learningPreferences = defineTable({
  userId: v.string(),

  // Flexible key-value system for preferences
  preferenceKey: v.string(),
  preferenceValue: v.union(v.boolean(), v.string(), v.number(), v.null()),

  // Category for organization
  category: v.union(
    v.literal("learning_style"),
    v.literal("content_preference"),
    v.literal("interaction_style"),
    v.literal("pace_preference"),
    v.literal("custom"),
  ),

  // Priority/weight for AI personalization
  weight: v.optional(v.number()),

  // Metadata
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_user_and_key", ["userId", "preferenceKey"])
  .index("by_user_and_category", ["userId", "category"]);
