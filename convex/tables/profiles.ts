import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  userStatusValidator,
  themePreferenceValidator,
} from "../profiles/validators";

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
  accountStatus: userStatusValidator,
})
  .index("by_userId", ["userId"])
  .index("by_onboarding_status", ["onboardingCompleted"])
  .index("by_last_active", ["lastActiveAt"]);

export const userSettings = defineTable({
  userId: v.string(),

  // Language and regional preferences
  preferredLanguage: v.string(),
  timezone: v.string(),

  // UI preferences
  theme: themePreferenceValidator,
  fontSize: v.optional(
    v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
  ),

  // Notification preferences
  emailNotifications: v.optional(v.boolean()),
  pushNotifications: v.optional(v.boolean()),

  // Accessibility
  highContrast: v.optional(v.boolean()),
  reducedMotion: v.optional(v.boolean()),
}).index("by_userId", ["userId"]);
