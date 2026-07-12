"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";

import { useChatUIStore } from "../stores/chat-ui-store";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useEnsureChatSession(roadmapId: Id<"roadmaps">) {
  const sessions = useQuery(api.chat.queries.listSessions, { roadmapId });
  const currentThreadId = useChatUIStore((state) => state.currentThreadId);
  const setCurrentThreadId = useChatUIStore(
    (state) => state.setCurrentThreadId,
  );
  const createSession = useMutation(api.chat.mutation.createSession);

  const hasTriggeredCreation = useRef(false);

  useEffect(() => {
    if (sessions === undefined || currentThreadId) return;

    if (sessions.length > 0) {
      setCurrentThreadId(sessions[0].threadId);
      return;
    }

    if (!hasTriggeredCreation.current) {
      hasTriggeredCreation.current = true;
      createSession({ roadmapId }).then(setCurrentThreadId);
    }
  }, [sessions, currentThreadId, roadmapId, createSession, setCurrentThreadId]);

  return { sessions, currentThreadId };
}
