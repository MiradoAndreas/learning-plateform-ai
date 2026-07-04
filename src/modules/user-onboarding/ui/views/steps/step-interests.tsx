"use client";

import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  interestsSchema,
  InterestsSchema,
} from "../../../validators/interest-schema";
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
import { OnboardingActions } from "../../components/onboarding-actions";
import { Plus, Trash2, X } from "lucide-react";
import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { InterestData } from "@/modules/user-onboarding/type";

interface StepInterestsProps {
  defaultValues?: InterestsSchema;
  onSave: (data: InterestData[]) => Promise<boolean>;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting: boolean;
}

// todos: the components step interests is very long, we can divise into many component

// todos: StepInterests

// todos:    InterestCard

//  todos:       TechnologyInput

//   todos:      ProficiencySelect

//      todos:   DomainInput

//   todos:      TopicInput

// todos: We can create a generic component: <FormInput /> <FormSelect /> <FormTextarea />

// todos: use useWatch instead of watch
const StepInterestsComponents = ({
  defaultValues,
  onSave,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSubmitting,
}: StepInterestsProps) => {
  const [techInput, setTechInput] = useState<{ [key: string]: string }>({});

  const form = useForm<InterestsSchema>({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      interests: defaultValues?.interests || [
        {
          domain: "",
          subdomain: "",
          topic: "",
          technologies: [],
          proficiency: "exploring",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "interests",
  });

  const addInterest = () => {
    if (fields.length < 10) {
      append({
        domain: "",
        subdomain: "",
        topic: "",
        technologies: [],
        proficiency: "exploring",
      });
    }
  };

  const removeInterest = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const addTechnology = (index: number) => {
    const inputKey = `tech-${index}`;
    const tech = techInput[inputKey]?.trim();
    if (tech) {
      const currentTechs =
        form.getValues(`interests.${index}.technologies`) || [];
      if (currentTechs.length < 10 && !currentTechs.includes(tech)) {
        form.setValue(`interests.${index}.technologies`, [
          ...currentTechs,
          tech,
        ]);
        setTechInput((prev) => ({ ...prev, [inputKey]: "" }));
      }
    }
  };

  const removeTechnology = (interestIndex: number, techIndex: number) => {
    const currentTechs =
      form.getValues(`interests.${interestIndex}.technologies`) || [];
    form.setValue(
      `interests.${interestIndex}.technologies`,
      currentTechs.filter((_, i) => i !== techIndex),
    );
  };

  const handleSubmit = async (data: InterestsSchema) => {
    console.log("RAW FORM DATA  : ", data);

    console.log("VALIDATION STATE: ", form.formState.errors);

    try {
      const success = await onSave(data.interests);
      console.log("Success ", success);
      if (success) {
        console.log("Succès DATA : ", data);
        onNext();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Get technologies for display
  const getTechnologies = (index: number) => {
    return form.watch(`interests.${index}.technologies`) || [];
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Existing interests */}
      {fields.map((field, index) => {
        const technologies = getTechnologies(index);
        const inputKey = `tech-${index}`;

        return (
          <div
            key={field.id}
            className="space-y-4 rounded-lg border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Interest {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInterest(index)}
                disabled={fields.length <= 1}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  control={form.control}
                  name={`interests.${index}.domain`}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`interests.${index}.domain`}>
                        Domain
                      </FieldLabel>
                      <Input
                        id={`interests.${index}.domain`}
                        placeholder="e.g., Computer Science"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name={`interests.${index}.subdomain`}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`interests.${index}.subdomain`}>
                        Subdomain (Optional)
                      </FieldLabel>
                      <Input
                        id={`interests.${index}.subdomain`}
                        placeholder="e.g., Artificial Intelligence"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name={`interests.${index}.topic`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`interests.${index}.topic`}>
                      Topic
                    </FieldLabel>
                    <Input
                      id={`interests.${index}.topic`}
                      placeholder="e.g., Neural Networks"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <FieldLabel htmlFor={inputKey}>
                  Technologies (Optional)
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id={inputKey}
                    placeholder="Add technology (e.g., PyTorch)"
                    value={techInput[inputKey] || ""}
                    onChange={(e) =>
                      setTechInput((prev) => ({
                        ...prev,
                        [inputKey]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTechnology(index);
                      }
                    }}
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTechnology(index)}
                    disabled={technologies.length >= 10}
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {technologies.map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      variant="secondary"
                      className="gap-1"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(index, techIndex)}
                        className="hover:text-destructive focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {technologies.length >= 10 && (
                    <p className="text-sm text-muted-foreground">
                      Maximum 10 technologies
                    </p>
                  )}
                </div>
              </Field>

              <Controller
                control={form.control}
                name={`interests.${index}.proficiency`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`interests.${index}.proficiency`}>
                      Proficiency Level
                    </FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id={`interests.${index}.proficiency`}>
                        <SelectValue placeholder="Select proficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exploring">Exploring</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
        );
      })}

      {/* Add interest button */}
      <Button
        type="button"
        variant="outline"
        onClick={addInterest}
        disabled={fields.length >= 10}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Another Interest
      </Button>
      {fields.length >= 10 && (
        <p className="text-center text-sm text-muted-foreground">
          Maximum 10 interests allowed
        </p>
      )}

      <OnboardingActions
        onNext={form.handleSubmit(handleSubmit)}
        onPrevious={onPrevious}
        isFirst={isFirst}
        isLast={isLast}
        isSubmitting={isSubmitting}
        nextLabel="Continue"
      />
    </form>
  );
};

StepInterestsComponents.displayName = "StepInterests";
export const StepInterests = memo(StepInterestsComponents);
