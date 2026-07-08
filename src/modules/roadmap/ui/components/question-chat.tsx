"use client";

import { useState } from "react";
import { BotIcon, SendIcon, Undo2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { useQuestionStore } from "../../stores/question-store";

export const QuestionChat = () => {
  const questions = useQuestionStore((state) => state.questions);
  const answers = useQuestionStore((state) => state.answers);
  const currentQuestionIndex = useQuestionStore(
    (state) => state.currentQuestionIndex,
  );
  const saveAnswer = useQuestionStore((state) => state.saveAnswer);
  const nextQuestion = useQuestionStore((state) => state.nextQuestion);
  const clearLastAnswer = useQuestionStore((state) => state.clearLastAnswer);
  const canClearLastAnswer = useQuestionStore((state) =>
    state.canClearLastAnswer(),
  );
  const completed = useQuestionStore((state) => state.isCompleted());

  const [draft, setDraft] = useState("");

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnsweredCurrent =
    !!currentQuestion && answers[currentQuestion.key] !== undefined;
  const visibleQuestions = questions.slice(0, currentQuestionIndex + 1);

  const lastAnsweredQuestion = [...questions]
    .reverse()
    .find((question) => answers[question.key] !== undefined);

  const handleAnswer = (value: string) => {
    if (!currentQuestion || !value.trim()) return;
    saveAnswer(currentQuestion.key, value.trim());
    setDraft("");
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    }
  };

  return (
    <div className="flex h-[420px] flex-col overflow-hidden rounded-lg border">
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1 px-4 py-4">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {visibleQuestions.map((question, index) => {
                const answer = answers[question.key];
                const isCurrent = index === currentQuestionIndex;

                return (
                  <div key={question.key} className="flex flex-col gap-3">
                    <MessageScrollerItem
                      messageId={`question-${question.key}`}
                      scrollAnchor={isCurrent}
                    >
                      <Message>
                        <MessageAvatar>
                          <Avatar>
                            <AvatarFallback>
                              <BotIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                        <MessageContent>
                          <Bubble>
                            <BubbleContent>
                              <p className="font-medium">{question.title}</p>
                              {question.description && (
                                <p className="text-sm text-gray-700">
                                  {question.description}
                                </p>
                              )}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>

                    {answer && (
                      <MessageScrollerItem messageId={`answer-${question.key}`}>
                        <Message align="end" className="pr-4">
                          <MessageContent>
                            <Bubble variant="muted">
                              <BubbleContent>{answer}</BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )}
                  </div>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      {canClearLastAnswer && lastAnsweredQuestion && (
        <div className="flex items-center justify-end border-t px-3 pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
              >
                <Undo2Icon className="h-3.5 w-3.5" />
                Effacer la dernière réponse
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Effacer cette réponse ?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>
                      Question : <strong>{lastAnsweredQuestion.title}</strong>
                    </p>
                    <p>
                      Réponse actuelle :{" "}
                      <strong>{answers[lastAnsweredQuestion.key]}</strong>
                    </p>
                    <p>
                      Vous reviendrez sur cette question pour y répondre à
                      nouveau.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearLastAnswer();
                    setDraft("");
                  }}
                >
                  Effacer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {!completed && currentQuestion && !hasAnsweredCurrent && (
        <div className="flex items-center gap-2 border-t p-3">
          {currentQuestion.options.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <>
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAnswer(draft);
                  }
                }}
                placeholder="Votre réponse..."
                autoComplete="off"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => handleAnswer(draft)}
                aria-label="Envoyer"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}

      {completed && (
        <div className="p-3 text-center text-sm text-muted-foreground">
          Toutes les questions ont été répondues
        </div>
      )}
    </div>
  );
};
