"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { BotIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { QuestionChat } from "../components/question-chat";
import { GeneratingIndicator } from "../components/generating-indicator";
import { useRoadmapStore } from "../../stores/roadmap-store";
import { useQuestionStore } from "../../stores/question-store";
import { api } from "../../../../../convex/_generated/api";

const formSchema = z.object({
  topic: z.string().min(1, "Le domaine doit avoir au moins 1 caractère"),
});

type FormValues = z.infer<typeof formSchema>;

export const FormRoadmapSection = () => {
  const [checked, setChecked] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const roadmapId = useRoadmapStore((state) => state.roadmapId);
  const setRoadmapId = useRoadmapStore((state) => state.setRoadmapId);
  const resetRoadmap = useRoadmapStore((state) => state.reset);

  const questions = useQuestionStore((state) => state.questions);
  const answers = useQuestionStore((state) => state.answers);
  const initializeQuestions = useQuestionStore((state) => state.initialize);
  const resetQuestions = useQuestionStore((state) => state.reset);
  const isQuestionsCompleted = useQuestionStore((state) => state.isCompleted());

  const createRoadmap = useMutation(api.roadmap.mutation.createRoadmap);
  const generateQuestionsAction = useAction(
    api.roadmap.action.generateQuestionsAction,
  );
  const submitAnswersAndGenerateRoadmap = useAction(
    api.roadmap.action.submitAnswersAndGenerateRoadmap,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: "" },
  });

  const handleCheck = async () => {
    const isValid = await form.trigger("topic");
    if (!isValid) {
      toast.info("Veuillez d'abord saisir un domaine");
      return;
    }

    const next = !checked;
    setChecked(next);

    if (!next) {
      resetQuestions();
      resetRoadmap();
      return;
    }

    try {
      setGeneratingQuestions(true);
      const topic = form.getValues("topic");

      const newRoadmapId = await createRoadmap({ topic });
      setRoadmapId(newRoadmapId);

      const { questions } = await generateQuestionsAction({
        roadmapId: newRoadmapId,
      });

      initializeQuestions(topic, questions);
    } catch (error) {
      toast.error("Impossible de générer les questions, réessayez.");
      setChecked(false);
      resetRoadmap();
      console.warn(error);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (checked && !isQuestionsCompleted) {
      toast.info("Merci de répondre à toutes les questions avant de continuer");
      return;
    }

    try {
      setSubmitting(true);

      // Si l'utilisateur n'a pas coché la case, aucun roadmap n'a encore
      // été créé -> on le crée maintenant, sans réponses.
      let targetRoadmapId = roadmapId;
      if (!targetRoadmapId) {
        targetRoadmapId = await createRoadmap({ topic: data.topic });
        setRoadmapId(targetRoadmapId);
      }

      const formattedAnswers = Object.entries(answers).map(([key, value]) => ({
        key,
        value,
      }));

      await submitAnswersAndGenerateRoadmap({
        roadmapId: targetRoadmapId,
        answers: formattedAnswers,
      });
    } catch (error) {
      toast.error("La génération du roadmap a échoué, réessayez.");
      console.warn(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-y-4">
      <form id="form" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="topic"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-topic">
                Vous voulez apprendre quoi exactement
              </FieldLabel>
              <Input
                {...field}
                id="form-topic"
                aria-invalid={fieldState.invalid}
                placeholder="Machine Learning"
                autoComplete="off"
                disabled={checked && questions.length > 0}
              />
              <FieldDescription>
                Ça devrait être un domaine qui vous passionne
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </form>

      <div className="flex items-center gap-x-2">
        <Checkbox
          className="h-5 w-5"
          checked={checked}
          onCheckedChange={handleCheck}
          disabled={generatingQuestions || submitting}
        />
        <p>Réponds à des questions pour un roadmap plus précis</p>
      </div>

      {generatingQuestions && (
        <GeneratingIndicator label="Génération des questions..." />
      )}

      {checked && !generatingQuestions && questions.length > 0 && (
        <div className="mt-4">
          <QuestionChat />
        </div>
      )}

      <Button
        type="submit"
        form="form"
        className="mt-8 w-full"
        disabled={
          generatingQuestions ||
          submitting ||
          (checked && !isQuestionsCompleted)
        }
      >
        <BotIcon />
        {submitting ? "Génération en cours..." : "Generate"}
      </Button>
    </div>
  );
};
