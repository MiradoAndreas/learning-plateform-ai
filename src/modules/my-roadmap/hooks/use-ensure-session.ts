"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";

import { useChatUIStore } from "../stores/chat-ui-store";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

export function useEnsureChatSession(roadmapId: Id<"roadmaps">) {
  const sessions = useQuery(api.chat.queries.listSessions, { roadmapId });
  const currentSessionId = useChatUIStore((state) => state.currentSessionId);
  const setCurrentSessionId = useChatUIStore(
    (state) => state.setCurrentSessionId,
  );
  const createSession = useMutation(api.chat.mutation.createSession);

  const hasTriggeredCreation = useRef(false);

  useEffect(() => {
    if (sessions === undefined || currentSessionId) return;

    if (sessions.length > 0) {
      setCurrentSessionId(sessions[0]._id);
      return;
    }

    // Aucune session pour cette roadmap -> on en crée une automatiquement,
    // une seule fois (évite un double-appel en concurrent mode / strict mode).
    if (!hasTriggeredCreation.current) {
      hasTriggeredCreation.current = true;
      createSession({ roadmapId }).then(setCurrentSessionId);
    }
  }, [
    sessions,
    currentSessionId,
    roadmapId,
    createSession,
    setCurrentSessionId,
  ]);

  return { sessions, currentSessionId };
}
