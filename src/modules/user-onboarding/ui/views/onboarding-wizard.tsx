"use client";

import { OnboardingStepper } from "../components/onboarding-stepper";
import { StepLearning } from "./steps/step-learning";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useOnboarding } from "../../hooks/use-onboarding";
import { StepInterests } from "./steps/step-interests";

interface OnboardingWizardProps {
  userId: string;
}

export function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const {
    currentStep,
    completedSteps,
    data,
    isLoading,
    isSubmitting,
    error,
    isComplete,
    saveLearningData,
    goToNext,
    goToPrevious,
    saveInterests,
  } = useOnboarding(userId);

  // Redirect if complete (handled in hook)
  if (isComplete) {
    return null;
  }

  const renderStep = () => {
    const commonProps = {
      onNext: goToNext,
      onPrevious: goToPrevious,
      isFirst: currentStep === 1,
      isLast: currentStep === 4,
      isSubmitting,
    };

    switch (currentStep) {
      case 1:
        return (
          <StepLearning
            {...commonProps}
            defaultValues={data.learning}
            onSave={saveLearningData}
          />
        );
      case 2:
        return (
          <StepInterests
            {...commonProps}
            defaultValues={{ interests: data.interests || [] }}
            onSave={saveInterests}
          />
        );
      default:
        return (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">More steps coming soon...</p>
          </div>
        );
    }
  };

  if (isLoading && !data.learning) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-4xl">
          <CardContent className="space-y-6 p-6 md:p-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Customize Your Learning Journey
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Step {currentStep} of 4
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stepper */}
          <OnboardingStepper
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          {/* Step content */}
          <div className="mt-12">{renderStep()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
