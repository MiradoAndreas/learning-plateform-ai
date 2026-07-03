import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userSettings = defineTable({
  userId: v.string(),

  // Language and regional preferences
  preferredLanguage: v.string(),
  timezone: v.string(),

  // UI preferences
  theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
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
