// Progress indicator component
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { STEPS, OnboardingStep } from "../../type";
import { memo } from "react";

interface OnboardingStepperProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  className?: string;
}

const OnboardingStepperComponent = ({
  currentStep,
  completedSteps,
  className,
}: OnboardingStepperProps) => {
  const totalSteps = Object.keys(STEPS).length;

  return (
    <nav className={cn("mx-auto w-full max-w-2xl", className)}>
      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div className="absolute top-1/2 right-0 left-0 h-[2px] -translate-y-1/2 bg-border" />

        {/* Progress line */}
        <motion.div
          className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 bg-primary"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />

        {Object.values(STEPS).map((step) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = step.number === currentStep;

          return (
            <div
              key={step.number}
              className="relative flex flex-col items-center"
            >
              <motion.div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-background text-foreground"
                      : "border-border bg-background text-muted-foreground",
                )}
                initial={{ scale: 1 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </motion.div>

              <span
                className={cn(
                  "absolute top-12 text-xs font-medium whitespace-nowrap",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

OnboardingStepperComponent.displayName = "OnboardingStepper";

export const OnboardingStepper = memo(OnboardingStepperComponent);
