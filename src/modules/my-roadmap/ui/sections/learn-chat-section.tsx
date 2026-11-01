"use client";

import { useEffect, useRef, useState } from "react";
import { BotIcon, TriangleAlertIcon } from "lucide-react";
import { ConvexError } from "convex/values";
import { useAction, useMutation, useQuery } from "convex/react";
import { useUIMessages } from "@convex-dev/agent/react";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { ChatMessageItem } from "../components/chat-message";
import { ChatInputBar } from "../components/chat-input-bar";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useChatUIStore } from "../../stores/chat-ui-store";
import { api } from "../../../../../convex/_generated/api";
import {
  MAX_EXCHANGES_PER_THREAD,
  THREAD_WARNING_THRESHOLD,
} from "../../../../../convex/chat/constants";
import { Node } from "@xyflow/react";

import { RoadmapNodeSelection } from "@/modules/roadmap/lib/roadmap-node-selection";

type LearnChatSectionProps = {
  roadmapId: Id<"roadmaps">;
  selectedNode: RoadmapNodeSelection | null;
};

export const LearnChatSection = ({
  roadmapId,
  selectedNode,
}: LearnChatSectionProps) => {
  const currentThreadId = useChatUIStore((state) => state.currentThreadId);
  const setCurrentThreadId = useChatUIStore(
    (state) => state.setCurrentThreadId,
  );
  const [isSending, setIsSending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const session = useQuery(
    api.chat.queries.getSession,
    currentThreadId ? { threadId: currentThreadId } : "skip",
  );
  const createSession = useMutation(api.chat.mutation.createSession);

  const { results: messages } = useUIMessages(
    api.chat.queries.listThreadMessages,
    currentThreadId ? { threadId: currentThreadId } : "skip",
    { initialNumItems: 20, stream: true },
  );
  const lastNodeId = useRef("");

  const sendMessage = useAction(api.chat.action.sendMessage);

  const exchangeCount = session?.messageCount ?? 0;
  const isThreadFull = exchangeCount >= MAX_EXCHANGES_PER_THREAD;
  const isNearingLimit =
    !isThreadFull && exchangeCount >= THREAD_WARNING_THRESHOLD;

  // Réinitialise l'alerte quand on change de session
  useEffect(() => {
    setLimitReached(false);
  }, [currentThreadId]);

  const handleCreateNewSession = async () => {
    const threadId = await createSession({ roadmapId });
    setCurrentThreadId(threadId);
  };

  const handleSend = async (content: string) => {
    if (!currentThreadId || isThreadFull) return;
    try {
      setIsSending(true);
      await sendMessage({ threadId: currentThreadId, roadmapId, content });
    } catch (error) {
      if (
        error instanceof ConvexError &&
        (error.data as { code?: string })?.code === "THREAD_LIMIT_REACHED"
      ) {
        setLimitReached(true);
      } else {
        throw error;
      }
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!selectedNode) return;
    if (!currentThreadId) return;
    if (isThreadFull) return;

    if (lastNodeId.current === selectedNode.id) {
      return;
    }

    lastNodeId.current = selectedNode.id;

    const send = async () => {
      try {
        setIsSending(true);
        await sendMessage({
          roadmapId,
          threadId: currentThreadId,
          content: `Explique moi le sujet "${selectedNode.data.label}" en détail`,
        });
      } catch (error) {
        if (
          error instanceof ConvexError &&
          (error.data as { code?: string })?.code === "THREAD_LIMIT_REACHED"
        ) {
          setLimitReached(true);
        }
      } finally {
        setIsSending(false);
      }
    };

    send();
  }, [selectedNode, currentThreadId, roadmapId, sendMessage, isThreadFull]);

  return (
    <div className="flex h-full flex-col md:h-162.5">
      <div className="flex items-center gap-x-2 border-b px-4 py-3">
        <SidebarTrigger />
        <BotIcon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">Assistant de la roadmap</p>
      </div>

      {isNearingLimit && (
        <div className="flex items-center gap-x-2 border-b bg-amber-50 px-4 py-2 text-xs text-amber-800">
          <TriangleAlertIcon className="h-3.5 w-3.5 shrink-0" />
          Cette discussion approche de sa limite ({exchangeCount}/
          {MAX_EXCHANGES_PER_THREAD}). Pensez à en créer une nouvelle bientôt.
        </div>
      )}

      {(isThreadFull || limitReached) && (
        <div className="flex flex-col items-center gap-y-2 border-b bg-destructive/10 px-4 py-3 text-center text-sm">
          <p className="text-destructive">
            Cette discussion a atteint sa limite d&apos;échanges.
          </p>
          <Button size="sm" onClick={handleCreateNewSession}>
            Créer une nouvelle discussion
          </Button>
        </div>
      )}

      {!currentThreadId ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Préparation de votre session de discussion...
        </div>
      ) : (
        <MessageScrollerProvider autoScroll>
          <MessageScroller className="flex-1 px-4 py-4">
            <MessageScrollerViewport>
              <MessageScrollerContent>
                {(messages ?? []).map((message, index) => (
                  <MessageScrollerItem
                    key={message.key}
                    messageId={message.key}
                    scrollAnchor={index === (messages?.length ?? 0) - 1}
                  >
                    <ChatMessageItem
                      role={message.role === "user" ? "user" : "assistant"}
                      content={message.text ?? ""}
                    />
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      <ChatInputBar
        onSend={handleSend}
        disabled={isSending || !currentThreadId || isThreadFull}
      />
    </div>
  );
};
