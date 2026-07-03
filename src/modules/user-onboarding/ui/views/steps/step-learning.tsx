"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  learningSchema,
  LearningSchema,
} from "../../../validators/learning-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { memo, useState } from "react";
import { OnboardingActions } from "../../components/onboarding-actions";
import { getDailyHoursInfo } from "@/modules/user-onboarding/utils";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface StepLearningProps {
  defaultValues?: Partial<LearningSchema>;
  onSave: (data: LearningSchema) => Promise<boolean>;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting: boolean;
}

const StepLearningComponent = ({
  defaultValues,
  onSave,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSubmitting,
}: StepLearningProps) => {
  const [secondaryGoalInput, setSecondaryGoalInput] = useState("");

  const form = useForm<LearningSchema>({
    resolver: zodResolver(learningSchema),
    defaultValues: {
      primaryGoal: defaultValues?.primaryGoal || "",
      secondaryGoals: defaultValues?.secondaryGoals || [],
      currentLevel: defaultValues?.currentLevel || "beginner",
      studyDaysPerWeek: defaultValues?.studyDaysPerWeek ?? 5,

      hoursPerStudyDay: defaultValues?.hoursPerStudyDay ?? 2,
      preferredPace: defaultValues?.preferredPace || "moderate",
      targetCompletionDate: defaultValues?.targetCompletionDate,
    },
  });

  const studyDays = form.watch("studyDaysPerWeek");
  const hoursPerStudyDay = form.watch("hoursPerStudyDay");

  const weeklyHours = studyDays * hoursPerStudyDay;

  const secondaryGoals = form.watch("secondaryGoals") || [];

  const addSecondaryGoal = () => {
    if (secondaryGoalInput.trim()) {
      const current = form.getValues("secondaryGoals") || [];
      if (current.length < 5) {
        form.setValue("secondaryGoals", [
          ...current,
          secondaryGoalInput.trim(),
        ]);
        setSecondaryGoalInput("");
      }
    }
  };

  const removeSecondaryGoal = (index: number) => {
    const current = form.getValues("secondaryGoals") || [];
    form.setValue(
      "secondaryGoals",
      current.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = async (data: LearningSchema) => {
    console.log(data);
    const success = await onSave(data);
    if (success) {
      onNext();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          control={form.control}
          name="primaryGoal"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="primaryGoal">
                Primary Learning Goal
              </FieldLabel>
              <Input
                id="primaryGoal"
                placeholder="e.g., Master Machine Learning, Learn Python"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <FieldLabel htmlFor="secondaryGoalInput">
            Secondary Goals (Optional, max 5)
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id="secondaryGoalInput"
              placeholder="Add a secondary goal"
              value={secondaryGoalInput}
              onChange={(e) => setSecondaryGoalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSecondaryGoal();
                }
              }}
              maxLength={100}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addSecondaryGoal}
              disabled={secondaryGoals.length >= 5}
            >
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {secondaryGoals.map((goal, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {goal}
                <button
                  type="button"
                  onClick={() => removeSecondaryGoal(index)}
                  className="hover:text-destructive focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {secondaryGoals.length >= 5 && (
            <p className="text-sm text-muted-foreground">
              Maximum 5 secondary goals
            </p>
          )}
        </Field>

        <Controller
          control={form.control}
          name="currentLevel"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="currentLevel">Current Level</FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="currentLevel">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            control={form.control}
            name="studyDaysPerWeek"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Study Days per Week</FieldLabel>

                <div className="mt-3 grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={field.value === day ? "default" : "outline"}
                      onClick={() => field.onChange(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {field.value} day{field.value > 1 ? "s" : ""} each week
                </p>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="hoursPerStudyDay"
            render={({ field, fieldState }) => {
              const info = getDailyHoursInfo(field.value);

              return (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="hoursPerStudyDay">
                      Hours per Study Day
                    </FieldLabel>

                    <Badge variant={info.variant}>{info.label}</Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <Input
                      id="hoursPerStudyDay"
                      type="number"
                      min={0}
                      max={8}
                      step={0.5}
                      className="w-24"
                      value={field.value}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        field.onChange(
                          Number.isNaN(value)
                            ? 0
                            : Math.min(8, Math.max(0, value)),
                        );
                      }}
                    />

                    <span className="text-sm text-muted-foreground">
                      hours/day
                    </span>
                  </div>

                  <div className="mt-5">
                    <Slider
                      min={0}
                      max={8}
                      step={0.5}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>0 h</span>
                    <span>2 h</span>
                    <span>4 h</span>
                    <span>6 h</span>
                    <span>8 h</span>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {info.description}
                  </p>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />
        </div>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex justify-between">
              <span>Study Days</span>

              <Badge variant="secondary">{studyDays}</Badge>
            </div>

            <div className="flex justify-between">
              <span>Hours / Study Day</span>

              <Badge variant="secondary">{hoursPerStudyDay} h</Badge>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Weekly Total</span>

              <Badge>{weeklyHours} h/week</Badge>
            </div>
          </CardContent>
        </Card>

        <Controller
          control={form.control}
          name="preferredPace"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Preferred Pace</FieldLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="relaxed" id="relaxed" />
                  <label htmlFor="relaxed" className="text-sm">
                    Relaxed
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <label htmlFor="moderate" className="text-sm">
                    Moderate
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intense" id="intense" />
                  <label htmlFor="intense" className="text-sm">
                    Intense
                  </label>
                </div>
              </RadioGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <OnboardingActions
          onNext={form.handleSubmit(handleSubmit)}
          onPrevious={onPrevious}
          isFirst={isFirst}
          isLast={isLast}
          isSubmitting={isSubmitting}
          nextLabel="Continue"
        />
      </FieldGroup>
    </form>
  );
};

StepLearningComponent.displayName = "StepLearning";
export const StepLearning = memo(StepLearningComponent);
