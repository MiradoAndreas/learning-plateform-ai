import { create } from "zustand";

type ChatUIState = {
  currentThreadId: string | null;
  setCurrentThreadId: (threadId: string | null) => void;
};

export const useChatUIStore = create<ChatUIState>((set) => ({
  currentThreadId: null,
  setCurrentThreadId: (threadId) => set({ currentThreadId: threadId }),
}));
