// Core hook for onboarding business logic
"use client";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";

import { useOnboardingStore } from "../stores/onboarding-store";
import { OnboardingData } from "../type";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { LearningSchema } from "../validators/learning-schema";

export function useOnboarding(userId: string) {
  const router = useRouter();

  const currentStep = useOnboardingStore((state) => state.currentStep);
  const completedSteps = useOnboardingStore((state) => state.completedSteps);
  const data = useOnboardingStore((state) => state.data);
  const isLoading = useOnboardingStore((state) => state.isLoading);
  const isSubmitting = useOnboardingStore((state) => state.isSubmitting);
  const error = useOnboardingStore((state) => state.error);
  const isComplete = useOnboardingStore((state) => state.isComplete);

  // Action
  const updateData = useOnboardingStore((state) => state.updateData);
  const markStepComplete = useOnboardingStore(
    (state) => state.markStepComplete,
  );
  const setLoading = useOnboardingStore((state) => state.setLoading);
  const setError = useOnboardingStore((state) => state.setError);
  const setComplete = useOnboardingStore((state) => state.setComplete);
  const goToNext = useOnboardingStore((state) => state.goToNext);
  const goToPrevious = useOnboardingStore((state) => state.goToPrevious);
  const setStep = useOnboardingStore((state) => state.setStep);

  // Convex queries
  const onboardingData = useQuery(api.onboarding.queries.getOnboardingData, {
    userId,
  });
  const progress = useQuery(api.onboarding.queries.getOnboardingProgress, {
    userId,
  });

  // Convex mutations
  const createOnboarding = useMutation(
    api.onboarding.mutations.createOnboardingData,
  );
  const updateStep = useMutation(api.onboarding.mutations.updateOnboardingStep);

  // Load existing data into store when available
  useEffect(() => {
    if (onboardingData) {
      const learningData: Partial<OnboardingData> = {
        learning: {
          primaryGoal: onboardingData.onboarding?.primaryGoal || "",
          secondaryGoals: onboardingData.onboarding?.secondaryGoals || [],
          currentLevel: onboardingData.onboarding?.currentLevel || "beginner",
          studyDaysPerWeek: onboardingData.onboarding?.studyDaysPerWeek || 0,
          hoursPerStudyDay: onboardingData.onboarding?.hoursPerStudyDay || 0,
          preferredPace: onboardingData.onboarding?.preferredPace || "moderate",
          targetCompletionDate: onboardingData.onboarding?.targetCompletionDate
            ? new Date(onboardingData.onboarding.targetCompletionDate)
            : undefined,
        },
      };
      updateData(learningData);
    }
  }, [onboardingData, updateData]);

  // Check if already completed
  useEffect(() => {
    if (progress?.onboardingCompleted) {
      setComplete(true);
      router.push("/dashboard");
    }
  }, [progress, router, setComplete]);

  // Save learning data
  const saveLearningData = useCallback(
    async (data: LearningSchema): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await createOnboarding({
          userId,
          primaryGoal: data.primaryGoal,
          secondaryGoals: data.secondaryGoals || [],
          currentLevel: data.currentLevel,
          studyDaysPerWeek: data.studyDaysPerWeek,
          hoursPerStudyDay: data.hoursPerStudyDay,
          preferredPace: data.preferredPace,
          targetCompletionDate: data.targetCompletionDate?.getTime(),
        });

        // todos: do someting if we need result
        console.log(result);

        // Update store
        updateData({ learning: data });
        markStepComplete(1);

        // Update step in Convex
        await updateStep({ userId, step: 2 });

        toast.success("Learning preferences saved");
        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to save learning data";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      createOnboarding,
      markStepComplete,
      setError,
      updateData,
      updateStep,
      userId,
      setLoading,
    ],
  );

  return {
    // State
    currentStep,
    completedSteps,
    data,
    isLoading,
    isSubmitting,
    error,
    isComplete,

    // Actions
    saveLearningData,
    goToNext,
    goToPrevious,
    setStep,
  };
}
