// Central type definitions

import { LearningSchema } from "./validators/learning-schema";

// Type definitions for User Onboarding feature
export type OnboardingStep = 1 | 2 | 3 | 4;

export const STEPS: Record<
  OnboardingStep,
  { label: string; number: OnboardingStep }
> = {
  1: { label: "Learning", number: 1 },
  2: { label: "Interests", number: 2 },
  3: { label: "Preferences", number: 3 },
  4: { label: "Review", number: 4 },
};

// Interest data
export interface InterestData {
  domain: string;
  subdomain?: string;
  topic: string;
  technologies: string[];
  proficiency:
    | "exploring"
    | "beginner"
    | "intermediate"
    | "advanced"
    | "expert";
}

// Preference data
export interface PreferenceData {
  key: string;
  value: boolean | string;
  category:
    | "learning_style"
    | "content_preference"
    | "interaction_style"
    | "pace_preference";
  label: string;
}

// Complete onboarding data
export interface OnboardingData {
  learning: LearningSchema;
  interests: InterestData[];
  preferences: PreferenceData[];
}

// Store state
export interface OnboardingStoreState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: Partial<OnboardingData>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  isComplete: boolean;
}

// Store actions
export interface OnboardingStoreActions {
  setStep: (step: OnboardingStep) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
  markStepComplete: (step: OnboardingStep) => void;
  setLoading: (isLoading: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
  setComplete: (isComplete: boolean) => void;
  reset: () => void;
}

// Combined store
export type OnboardingStore = OnboardingStoreState & OnboardingStoreActions;

// Convex mutation args (re-exported for convenience)
export type CreateOnboardingArgs = {
  userId: string;
  primaryGoal: string;
  secondaryGoals: string[];
  currentLevel: LearningSchema["currentLevel"];
  studyDaysPerWeek: number;
  hoursPerStudyDay: number;
  preferredPace: LearningSchema["preferredPace"];
  targetCompletionDate?: number;
};
