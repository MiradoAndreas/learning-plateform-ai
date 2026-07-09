import { create } from "zustand";
import { Id } from "../../../../convex/_generated/dataModel";

type ChatUIState = {
  currentSessionId: Id<"chat_sessions"> | null;
  setCurrentSessionId: (sessionId: Id<"chat_sessions"> | null) => void;
};

export const useChatUIStore = create<ChatUIState>((set) => ({
  currentSessionId: null,
  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
}));
