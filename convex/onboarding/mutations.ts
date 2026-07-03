import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createOnboardingData = mutation({
  args: {
    userId: v.string(),
    primaryGoal: v.string(),
    secondaryGoals: v.optional(v.array(v.string())),
    currentLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert"),
    ),
    studyDaysPerWeek: v.number(),
    hoursPerStudyDay: v.number(),
    preferredPace: v.union(
      v.literal("relaxed"),
      v.literal("moderate"),
      v.literal("intense"),
    ),
    targetCompletionDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create onboarding data
    const onboardingId = await ctx.db.insert("onboarding_data", {
      userId: args.userId,
      primaryGoal: args.primaryGoal,
      secondaryGoals: args.secondaryGoals,
      currentLevel: args.currentLevel,
      studyDaysPerWeek: args.studyDaysPerWeek,
      hoursPerStudyDay: args.hoursPerStudyDay,
      preferredPace: args.preferredPace,
      targetCompletionDate: args.targetCompletionDate,
      startDate: now,
      version: 1,
      lastUpdatedAt: now,
    });

    // Update user profile
    await ctx.db
      .query("user_profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first()
      .then(async (profile) => {
        if (profile) {
          await ctx.db.patch(profile._id, {
            onboardingStartedAt: now,
            onboardingStep: 1,
          });
        }
      });

    return onboardingId;
  },
});

export const updateOnboardingStep = mutation({
  args: {
    userId: v.string(),
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("user_profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        onboardingStep: args.step,
      });
    }
  },
});

export const completeOnboarding = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Update profile
    const profile = await ctx.db
      .query("user_profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        onboardingCompleted: true,
        onboardingCompletedAt: now,
      });
    }

    // Update onboarding data
    const onboarding = await ctx.db
      .query("onboarding_data")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (onboarding) {
      await ctx.db.patch(onboarding._id, {
        completedAt: now,
        lastUpdatedAt: now,
      });
    }
  },
});

export const addLearningPreference = mutation({
  args: {
    userId: v.string(),
    preferenceKey: v.string(),
    preferenceValue: v.union(v.boolean(), v.string(), v.number(), v.null()),
    category: v.union(
      v.literal("learning_style"),
      v.literal("content_preference"),
      v.literal("interaction_style"),
      v.literal("pace_preference"),
      v.literal("custom"),
    ),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if preference exists
    const existing = await ctx.db
      .query("learning_preferences")
      .withIndex("by_user_and_key", (q) =>
        q.eq("userId", args.userId).eq("preferenceKey", args.preferenceKey),
      )
      .first();

    if (existing) {
      // Update existing preference
      await ctx.db.patch(existing._id, {
        preferenceValue: args.preferenceValue,
        category: args.category,
        weight: args.weight,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new preference
    return await ctx.db.insert("learning_preferences", {
      userId: args.userId,
      preferenceKey: args.preferenceKey,
      preferenceValue: args.preferenceValue,
      category: args.category,
      weight: args.weight,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});
