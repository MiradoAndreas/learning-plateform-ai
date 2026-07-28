// src/modules/roadmap/ui/components/node-action-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { BookOpenIcon, ListChecksIcon, ArrowLeftIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { useQuizUIStore } from "../../stores/quiz-ui-store";

type NodeActionDialogProps = {
  roadmapId: Id<"roadmaps">;
  onLearn: (nodeId: string, nodeLabel: string) => void;
};

type LoadedQuestion = { question: string; options: string[] };

export const NodeActionDialog = ({
  roadmapId,
  onLearn,
}: NodeActionDialogProps) => {
  const activeNodeId = useQuizUIStore((s) => s.activeNodeId);
  const activeNodeLabel = useQuizUIStore((s) => s.activeNodeLabel);
  const mode = useQuizUIStore((s) => s.mode);
  const answers = useQuizUIStore((s) => s.answers);
  const isSubmitting = useQuizUIStore((s) => s.isSubmitting);
  const setAnswer = useQuizUIStore((s) => s.setAnswer);
  const setSubmitting = useQuizUIStore((s) => s.setSubmitting);
  const startQuiz = useQuizUIStore((s) => s.startQuiz);
  const backToMenu = useQuizUIStore((s) => s.backToMenu);
  const closeDialog = useQuizUIStore((s) => s.closeDialog);

  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
  } | null>(null);

  const getOrCreateNodeQuiz = useAction(api.roadmap.action.getOrCreateNodeQuiz);
  const submitNodeQuiz = useMutation(api.roadmap.mutation.submitNodeQuiz);

  // Ne charge le quiz que lorsqu'on entre réellement en mode "quiz"
  useEffect(() => {
    if (mode !== "quiz" || !activeNodeId || !activeNodeLabel) return;
    if (quizId) return; // déjà chargé pour ce passage

    setResult(null);
    setIsLoadingQuiz(true);

    getOrCreateNodeQuiz({
      roadmapId,
      nodeId: activeNodeId,
      nodeLabel: activeNodeLabel,
    })
      .then((res) => {
        setQuizId(res.quizId);
        setQuestions(res.questions);
      })
      .finally(() => setIsLoadingQuiz(false));
  }, [
    mode,
    activeNodeId,
    activeNodeLabel,
    roadmapId,
    quizId,
    getOrCreateNodeQuiz,
  ]);

  // Réinitialise le quiz chargé quand on change de nœud ou qu'on ferme
  useEffect(() => {
    if (!activeNodeId) {
      setQuizId(null);
      setQuestions([]);
      setResult(null);
    }
  }, [activeNodeId]);

  const handleLearn = () => {
    if (!activeNodeId || !activeNodeLabel) return;
    onLearn(activeNodeId, activeNodeLabel);
    closeDialog();
  };

  const handleSubmit = async () => {
    if (!activeNodeId || !quizId) return;

    try {
      setSubmitting(true);
      const orderedAnswers = questions.map((_, index) => answers[index] ?? -1);

      const res = await submitNodeQuiz({
        roadmapId,
        nodeId: activeNodeId,
        quizId: quizId as Id<"roadmapNodeQuizzes">,
        answers: orderedAnswers,
      });

      setResult(res);
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered =
    questions.length > 0 &&
    questions.every((_, index) => answers[index] !== undefined);

  return (
    <Dialog
      open={!!activeNodeId}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-x-2">
            {mode === "quiz" && !result && (
              <button
                type="button"
                onClick={backToMenu}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Retour"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
            )}
            {activeNodeLabel}
          </DialogTitle>
        </DialogHeader>

        {mode === "menu" && (
          <div className="flex flex-col gap-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Que voulez-vous faire avec ce sujet ?
            </p>

            <button
              type="button"
              onClick={handleLearn}
              className="flex items-center gap-x-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <BookOpenIcon className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Apprendre</p>
                <p className="text-xs text-muted-foreground">
                  Recevoir une explication détaillée dans le chat
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={startQuiz}
              className="flex items-center gap-x-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <ListChecksIcon className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Passer le quiz</p>
                <p className="text-xs text-muted-foreground">
                  Valider vos connaissances pour débloquer la suite
                </p>
              </div>
            </button>
          </div>
        )}

        {mode === "quiz" &&
          (isLoadingQuiz ? (
            <p className="text-sm text-muted-foreground">
              Préparation du quiz...
            </p>
          ) : result ? (
            <div className="flex flex-col items-center gap-y-3 py-4 text-center">
              <p
                className={cn(
                  "text-lg font-semibold",
                  result.passed ? "text-emerald-600" : "text-destructive",
                )}
              >
                {result.passed ? "Quiz réussi !" : "Quiz échoué"}
              </p>
              <p className="text-sm text-muted-foreground">
                Score : {Math.round(result.score * 100)}%
              </p>
              {result.passed ? (
                <Button onClick={closeDialog}>Continuer</Button>
              ) : (
                <div className="flex gap-x-2">
                  <Button variant="outline" onClick={backToMenu}>
                    Retour
                  </Button>
                  <Button onClick={() => setResult(null)}>Réessayer</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-y-5">
              {questions.map((q, questionIndex) => (
                <div key={questionIndex} className="flex flex-col gap-y-2">
                  <p className="text-sm font-medium">
                    {questionIndex + 1}. {q.question}
                  </p>
                  <div className="flex flex-col gap-y-1.5">
                    {q.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        type="button"
                        onClick={() => setAnswer(questionIndex, optionIndex)}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                          answers[questionIndex] === optionIndex
                            ? "border-primary bg-primary/10"
                            : "hover:bg-muted",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
              >
                {isSubmitting ? "Vérification..." : "Valider le quiz"}
              </Button>
            </div>
          ))}
      </DialogContent>
    </Dialog>
  );
};
