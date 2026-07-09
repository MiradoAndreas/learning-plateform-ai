import { create } from "zustand";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
};

type LearnChatState = {
  sessions: ChatSession[];
  messagesBySession: Record<string, ChatMessage[]>;
  currentSessionId: string;
  isSending: boolean;

  selectSession: (sessionId: string) => void;
  createSession: () => void;
  sendMessage: (content: string) => void;
};

const INITIAL_SESSION_ID = "session-1";

const initialSessions: ChatSession[] = [
  { id: INITIAL_SESSION_ID, title: "Bases du sujet", updatedAt: Date.now() },
];

const initialMessages: Record<string, ChatMessage[]> = {
  [INITIAL_SESSION_ID]: [
    {
      id: "msg-1",
      role: "assistant",
      content:
        "Bonjour ! Je suis là pour vous aider à avancer sur votre roadmap. Sur quelle étape voulez-vous travailler ?",
    },
  ],
};

export const useLearnChatStore = create<LearnChatState>((set, get) => ({
  sessions: initialSessions,
  messagesBySession: initialMessages,
  currentSessionId: INITIAL_SESSION_ID,
  isSending: false,

  selectSession: (sessionId) => {
    set({ currentSessionId: sessionId });
  },

  createSession: () => {
    const id = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: "Nouvelle discussion",
      updatedAt: Date.now(),
    };

    set((state) => ({
      sessions: [newSession, ...state.sessions],
      messagesBySession: {
        ...state.messagesBySession,
        [id]: [
          {
            id: `${id}-welcome`,
            role: "assistant",
            content:
              "Nouvelle discussion démarrée. Que voulez-vous apprendre ?",
          },
        ],
      },
      currentSessionId: id,
    }));
  },

  sendMessage: (content) => {
    const { currentSessionId, messagesBySession } = get();
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
    };

    set({
      messagesBySession: {
        ...messagesBySession,
        [currentSessionId]: [
          ...(messagesBySession[currentSessionId] ?? []),
          userMessage,
        ],
      },
      isSending: true,
    });

    // Réponse simulée (UI only) — sera remplacée par un appel Convex plus tard
    setTimeout(() => {
      set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [currentSessionId]: [
            ...(state.messagesBySession[currentSessionId] ?? []),
            {
              id: `msg-${Date.now()}-bot`,
              role: "assistant",
              content:
                "(Réponse simulée) Cette section sera bientôt connectée à l'IA.",
            },
          ],
        },
        isSending: false,
      }));
    }, 800);
  },
}));
