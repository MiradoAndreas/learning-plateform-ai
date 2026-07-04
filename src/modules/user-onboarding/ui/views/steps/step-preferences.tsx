"use client";

import { memo, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  preferencesSchema,
  PreferencesSchema,
  PREFERENCE_OPTIONS,
  PreferenceOption,
} from "../../../validators/preference-schema";
import { Toggle } from "@/components/ui/toggle";
import { Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingActions } from "../../components/onboarding-actions";
import { motion } from "framer-motion";
import { PreferenceData } from "@/modules/user-onboarding/type";

interface StepPreferencesProps {
  defaultValues?: PreferencesSchema;
  onSave: (preferences: PreferenceData[]) => Promise<boolean>;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting: boolean;
}

// Group preferences by category for better UX
const groupPreferencesByCategory = (options: readonly PreferenceOption[]) => {
  const grouped = options.reduce(
    (acc, opt) => {
      const category = opt.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(opt);
      return acc;
    },
    {} as Record<string, PreferenceOption[]>,
  );

  return grouped;
};

const categoryLabels = {
  learning_style: "Style d'apprentissage",
  content_preference: "Preference contenu",
  interaction_style: "Style d'interaction",
  pace_preference: "Preference allure",
};

const StepPreferencesComponent = ({
  defaultValues,
  onSave,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSubmitting,
}: StepPreferencesProps) => {
  const groupedOptions: Record<string, PreferenceOption[]> = useMemo(
    () => groupPreferencesByCategory(PREFERENCE_OPTIONS),
    [],
  );

  // Create initial preferences from default values or use defaults
  const getInitialPreferences = useCallback((): PreferenceData[] => {
    if (defaultValues?.preferences && defaultValues.preferences.length > 0) {
      return defaultValues.preferences;
    }
    return PREFERENCE_OPTIONS.map((opt) => ({
      key: opt.key,
      value: opt.defaultValue,
      category: opt.category,
      label: opt.label,
    }));
  }, [defaultValues]);

  const form = useForm<PreferencesSchema>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferences: getInitialPreferences(),
    },
  });

  const keyToIndex = useMemo(() => {
    const map = new Map<string, number>();
    getInitialPreferences().forEach((pref, index) => {
      map.set(pref.key, index);
    });
    return map;
  }, [getInitialPreferences]);

  const handleSubmit = async (data: PreferencesSchema) => {
    const success = await onSave(data.preferences);

    if (success) {
      onNext();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      {Object.entries(groupedOptions).map(
        ([category, options]: [string, PreferenceOption[]], categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium capitalize">
              {categoryLabels[category as keyof typeof categoryLabels] ||
                category}
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {options.map((option) => {
                const index = keyToIndex.get(option.key)!;
                const isBoolean = typeof option.defaultValue === "boolean";

                return (
                  <div
                    key={option.key}
                    className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <div className="flex items-center">
                      <Controller
                        control={form.control}
                        name={`preferences.${index}.value`}
                        render={({ field }) =>
                          isBoolean ? (
                            <Toggle
                              pressed={field.value as boolean}
                              onPressedChange={field.onChange}
                              aria-label={`Toggle ${option.label}`}
                              variant="outline"
                              size="sm"
                              className="w-28 gap-1.5 border-2 data-[state=off]:border-muted-foreground/30 data-[state=off]:text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              {field.value ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Activé
                                </>
                              ) : (
                                <>
                                  <X className="h-4 w-4" />
                                  Désactivé
                                </>
                              )}
                            </Toggle>
                          ) : (
                            <Select
                              value={field.value as string}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="always">Always</SelectItem>
                                <SelectItem value="sometimes">
                                  Sometimes
                                </SelectItem>
                                <SelectItem value="rarely">Rarely</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                              </SelectContent>
                            </Select>
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ),
      )}

      <OnboardingActions
        onNext={form.handleSubmit(handleSubmit)}
        onPrevious={onPrevious}
        isFirst={isFirst}
        isLast={isLast}
        isSubmitting={isSubmitting}
        nextLabel="Review"
      />
    </form>
  );
};

StepPreferencesComponent.displayName = "StepPreferences";
export const StepPreferences = memo(StepPreferencesComponent);
