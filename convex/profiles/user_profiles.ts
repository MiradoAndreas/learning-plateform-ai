import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userProfiles = defineTable({
  // Reference to Better Auth user
  userId: v.string(),

  // Basic profile information
  fullName: v.string(),
  displayName: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  bio: v.optional(v.string()),

  // Onboarding status
  onboardingCompleted: v.boolean(),
  onboardingStep: v.optional(v.number()),
  onboardingStartedAt: v.optional(v.number()),
  onboardingCompletedAt: v.optional(v.number()),

  // Metadata
  lastActiveAt: v.number(),
  accountStatus: v.union(
    v.literal("active"),
    v.literal("suspended"),
    v.literal("deleted"),
  ),
})
  .index("by_userId", ["userId"])
  .index("by_onboarding_status", ["onboardingCompleted"])
  .index("by_last_active", ["lastActiveAt"]);
