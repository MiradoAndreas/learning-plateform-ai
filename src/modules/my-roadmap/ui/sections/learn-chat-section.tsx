"use client";

import { useState } from "react";
import { BotIcon } from "lucide-react";
import { useAction } from "convex/react";
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

import { ChatMessageItem } from "../components/chat-message";
import { ChatInputBar } from "../components/chat-input-bar";
import { TypingIndicator } from "../components/typing-indicator";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useChatUIStore } from "../../stores/chat-ui-store";
import { api } from "../../../../../convex/_generated/api";

type LearnChatSectionProps = {
  roadmapId: Id<"roadmaps">;
};

export const LearnChatSection = ({ roadmapId }: LearnChatSectionProps) => {
  const currentThreadId = useChatUIStore((state) => state.currentThreadId);
  const [isSending, setIsSending] = useState(false);

  const { results: messages } = useUIMessages(
    api.chat.queries.listThreadMessages,
    currentThreadId ? { threadId: currentThreadId } : "skip",
    { initialNumItems: 20 },
  );

  const sendMessage = useAction(api.chat.action.sendMessage);

  const handleSend = async (content: string) => {
    if (!currentThreadId) return;
    try {
      setIsSending(true);
      await sendMessage({ threadId: currentThreadId, roadmapId, content });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[650px] flex-col">
      <div className="flex items-center gap-x-2 border-b px-4 py-3">
        <SidebarTrigger />
        <BotIcon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">Assistant de la roadmap</p>
      </div>

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
                {isSending && (
                  <MessageScrollerItem messageId={`${currentThreadId}-typing`}>
                    <TypingIndicator />
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      <ChatInputBar
        onSend={handleSend}
        disabled={isSending || !currentThreadId}
      />
    </div>
  );
};
