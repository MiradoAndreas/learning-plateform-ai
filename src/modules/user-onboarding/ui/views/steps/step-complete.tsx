"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "../../../type";

interface StepCompleteProps {
  data: Partial<OnboardingData> | null;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  onPrevious: () => void;
}

export function StepComplete({
  data,
  onSubmit,
  isSubmitting,
  onPrevious,
}: StepCompleteProps) {
  if (!data || !data.learning) {
    return (
      <div className="rounded-lg border border-border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No data to review. Please go back and complete all steps.
        </p>
      </div>
    );
  }

  const { learning, interests, preferences } = data;

  // Helper to get preference label
  const getPreferenceLabel = (key: string): string => {
    const labels: Record<string, string> = {
      likes_analogies: "Likes Analogies",
      likes_examples: "Likes Examples",
      likes_visual_explanations: "Likes Visual Explanations",
      likes_diagrams: "Likes Diagrams",
      likes_code_examples: "Likes Code Examples",
      likes_exercises: "Likes Exercises",
      likes_quizzes: "Likes Quizzes",
      likes_project_based: "Likes Project-Based Learning",
      prefers_concise_explanations: "Prefers Concise Explanations",
      prefers_detailed_explanations: "Prefers Detailed Explanations",
      prefers_theory_first: "Prefers Theory First",
      prefers_practice_first: "Prefers Practice First",
      prefers_step_by_step: "Prefers Step-by-Step",
      prefers_rapid_pace: "Prefers Rapid Pace",
      prefers_self_paced: "Prefers Self-Paced Learning",
      prefers_structured_curriculum: "Prefers Structured Curriculum",
    };
    return labels[key] || key.replace(/_/g, " ");
  };

  // Get active preferences (true or non-default values)
  const activePreferences =
    preferences?.filter((p) => {
      if (typeof p.value === "boolean") {
        return p.value === true;
      }
      return p.value !== "never";
    }) || [];

  // Design tokens only: every icon uses `primary` or `muted-foreground`,
  // no arbitrary Tailwind palette colors (blue-500 / green-500 / purple-500 removed)
  const summaryItems = [
    {
      label: "Primary Goal",
      value: learning.primaryGoal || "Not set",
    },
    {
      label: "Current Level",
      value: learning.currentLevel || "Not set",
    },
    {
      label: "Weekly Commitment",
      value: `${learning.hoursPerStudyDay || 0}h/week`,
    },
    {
      label: "Preferred Pace",
      value: learning.preferredPace || "Not set",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Review your journey
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Confirm your selections below, or go back to make changes.
        </p>
      </motion.div>

      {/* Summary Grid */}
      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
        role="list"
        aria-label="Onboarding summary"
      >
        {summaryItems.map((item, index) => (
          <motion.div
            key={item.label}
            role="listitem"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
          >
            <Card className="border-border bg-card transition-colors hover:bg-primary">
              <CardContent className="flex flex-col items-center gap-1.5 p-4 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="line-clamp-1 text-sm font-medium text-foreground capitalize">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Secondary Goals */}
      {learning.secondaryGoals && learning.secondaryGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-foreground">
            Secondary Goals
          </h3>
          <div className="flex flex-wrap gap-2">
            {learning.secondaryGoals.map((goal, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="border border-transparent font-normal"
              >
                {goal}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Interests */}
      {interests && interests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="space-y-3"
        >
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            Interests
            <span className="text-muted-foreground">({interests.length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {interests.map((interest, index) => (
              <Card key={index} className="border-border bg-card">
                <CardContent className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {interest.topic}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {interest.domain}
                        {interest.subdomain ? ` → ${interest.subdomain}` : ""}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-border text-xs font-normal text-muted-foreground"
                    >
                      {interest.proficiency}
                    </Badge>
                  </div>
                  {interest.technologies &&
                    interest.technologies.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {interest.technologies.map((tech, techIndex) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Preferences */}
      {activePreferences.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-foreground">
            Learning Preferences
          </h3>
          <div className="flex flex-wrap gap-2">
            {activePreferences.map((pref, index) => (
              <Badge
                key={index}
                variant="outline"
                className="gap-1.5 border-border font-normal text-foreground"
              >
                <Check className="h-3 w-3 text-primary" aria-hidden="true" />
                {getPreferenceLabel(pref.key)}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Target Date */}
      {learning.targetCompletionDate && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span>
            Target completion:{" "}
            <span className="font-medium text-foreground">
              {new Date(learning.targetCompletionDate).toLocaleDateString()}
            </span>
          </span>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row"
      >
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="flex-1 border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Go back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          size="lg"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              Completing…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Complete onboarding
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
