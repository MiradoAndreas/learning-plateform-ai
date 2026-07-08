import { create } from "zustand";

export type Question = {
  key: string;
  title: string;
  description: string | null;
  required: boolean;
  options: string[];
};

export type Answers = Record<string, string>;

type QuestionState = {
  // State
  topic: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answers;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: (topic: string, questions: Question[]) => void;
  saveAnswer: (key: string, value: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  clearLastAnswer: () => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Getters (computed)
  currentQuestion: () => Question | null;
  progress: () => number;
  isFirstQuestion: () => boolean;
  isLastQuestion: () => boolean;
  answeredCount: () => number;
  completionRate: () => number;
  isCompleted: () => boolean;
  canClearLastAnswer: () => boolean;
};

const initialState = {
  topic: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  loading: false,
  error: null,
};

export const useQuestionStore = create<QuestionState>((set, get) => ({
  ...initialState,

  initialize: (topic, questions) => {
    set({
      topic,
      questions,
      currentQuestionIndex: 0,
      answers: {},
      loading: false,
      error: null,
    });
  },

  saveAnswer: (key, value) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [key]: value,
      },
    }));
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  clearLastAnswer: () => {
    const { questions, answers } = get();

    // Find the most recently answered question, regardless of where
    // currentQuestionIndex currently points (handles the "last question,
    // already completed" case as well as the normal in-progress case).
    let lastAnsweredIndex = -1;
    for (let i = questions.length - 1; i >= 0; i -= 1) {
      if (answers[questions[i].key] !== undefined) {
        lastAnsweredIndex = i;
        break;
      }
    }

    if (lastAnsweredIndex === -1) {
      return;
    }

    const { [questions[lastAnsweredIndex].key]: _removed, ...rest } = answers;

    set({
      answers: rest,
      currentQuestionIndex: lastAnsweredIndex,
    });
  },

  reset: () => {
    set(initialState);
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  currentQuestion: () => {
    const { questions, currentQuestionIndex } = get();
    return questions[currentQuestionIndex] ?? null;
  },

  progress: () => {
    const { currentQuestionIndex, questions } = get();
    if (questions.length === 0) return 0;
    return currentQuestionIndex / questions.length;
  },

  isFirstQuestion: () => {
    const { currentQuestionIndex } = get();
    return currentQuestionIndex === 0;
  },

  isLastQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    return currentQuestionIndex === questions.length - 1;
  },

  answeredCount: () => {
    const { answers } = get();
    return Object.keys(answers).length;
  },

  completionRate: () => {
    const { questions, answers } = get();
    if (questions.length === 0) return 0;
    return Object.keys(answers).length / questions.length;
  },

  isCompleted: () => {
    const { questions, answers } = get();
    if (questions.length === 0) return false;
    return questions.every((question) => answers[question.key] !== undefined);
  },

  canClearLastAnswer: () => {
    const { answers } = get();
    return Object.keys(answers).length > 0;
  },
}));
