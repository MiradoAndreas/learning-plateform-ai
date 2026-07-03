// Zustand store
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OnboardingStore, OnboardingStep, OnboardingData } from "../type";

const INITIAL_STATE = {
  currentStep: 1 as OnboardingStep,
  completedSteps: [] as OnboardingStep[],
  data: {} as Partial<OnboardingData>,
  isLoading: false,
  isSubmitting: false,
  error: null as string | null,
  isComplete: false,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setStep: (step: OnboardingStep) => {
        set({ currentStep: step });
      },

      goToNext: () => {
        const { currentStep } = get();
        if (currentStep < 4) {
          const nextStep = (currentStep + 1) as OnboardingStep;
          set({ currentStep: nextStep });
        }
      },

      goToPrevious: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          const prevStep = (currentStep - 1) as OnboardingStep;
          set({ currentStep: prevStep });
        }
      },

      updateData: (data: Partial<OnboardingData>) => {
        set((state) => ({
          data: {
            ...state.data,
            ...data,
          },
        }));
      },

      markStepComplete: (step: OnboardingStep) => {
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        }));
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setComplete: (isComplete: boolean) => {
        set({ isComplete });
      },

      reset: () => {
        set(INITIAL_STATE);
      },
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        data: state.data,
        isComplete: state.isComplete,
      }),
    },
  ),
);
