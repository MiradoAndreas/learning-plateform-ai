import { query } from "../_generated/server";
import { v } from "convex/values";

export const getOnboardingData = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("onboarding_data")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!onboarding) {
      return null;
    }

    // Fetch related data in parallel
    const [preferences, interests, goals] = await Promise.all([
      ctx.db
        .query("learning_preferences")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("interests")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("learning_goals")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect(),
    ]);

    return {
      onboarding,
      preferences,
      interests,
      goals,
    };
  },
});

export const getOnboardingProgress = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("user_profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      return null;
    }

    return {
      onboardingCompleted: profile.onboardingCompleted,
      onboardingStep: profile.onboardingStep || 0,
      onboardingStartedAt: profile.onboardingStartedAt,
      onboardingCompletedAt: profile.onboardingCompletedAt,
    };
  },
});
