import { defineSchema } from "convex/server";
import { v } from "convex/values";

// Import all table definitions
import { userProfiles } from "./profiles/user_profiles";
import { userSettings } from "./profiles/user_settings";
import { onboardingData } from "./onboarding/onboarding_data";
import { learningPreferences } from "./onboarding/learning_preferences";
import { interests } from "./onboarding/interests";
import { learningGoals } from "./onboarding/learning_goals";
import { learningProfiles } from "./ai/learning_profiles";

export default defineSchema({
  user_profiles: userProfiles,
  user_settings: userSettings,
  onboarding_data: onboardingData,
  learning_preferences: learningPreferences,
  interests: interests,
  learning_goals: learningGoals,
  learning_profiles: learningProfiles,
});
