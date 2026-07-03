// Navigation buttons component

"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingActionsProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  className?: string;
}

export function OnboardingActions({
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSubmitting = false,
  nextLabel = "Continue",
  className,
}: OnboardingActionsProps) {
  return (
    <div className={cn("mt-8 flex justify-between border-t pt-6", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirst || isSubmitting}
        className="min-w-[100px]"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="min-w-[100px]"
      >
        {nextLabel}
        {!isLast && <ChevronRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
}
