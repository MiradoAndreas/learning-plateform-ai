// src/modules/roadmap/stores/quiz-ui-store.ts
import { create } from "zustand";

type QuizAnswers = Record<number, number>;
type NodeDialogMode = "menu" | "quiz";

type QuizUIState = {
  activeNodeId: string | null;
  activeNodeLabel: string | null;
  mode: NodeDialogMode;
  answers: QuizAnswers;
  isSubmitting: boolean;

  openNodeMenu: (nodeId: string, nodeLabel: string) => void;
  startQuiz: () => void;
  backToMenu: () => void;
  closeDialog: () => void;
  setAnswer: (questionIndex: number, optionIndex: number) => void;
  setSubmitting: (value: boolean) => void;
};

export const useQuizUIStore = create<QuizUIState>((set) => ({
  activeNodeId: null,
  activeNodeLabel: null,
  mode: "menu",
  answers: {},
  isSubmitting: false,

  openNodeMenu: (nodeId, nodeLabel) =>
    set({
      activeNodeId: nodeId,
      activeNodeLabel: nodeLabel,
      mode: "menu",
      answers: {},
    }),

  startQuiz: () => set({ mode: "quiz" }),

  backToMenu: () => set({ mode: "menu", answers: {} }),

  closeDialog: () =>
    set({
      activeNodeId: null,
      activeNodeLabel: null,
      mode: "menu",
      answers: {},
    }),

  setAnswer: (questionIndex, optionIndex) =>
    set((state) => ({
      answers: { ...state.answers, [questionIndex]: optionIndex },
    })),

  setSubmitting: (value) => set({ isSubmitting: value }),
}));
