"use client";

import { useState } from "react";
import { BotIcon } from "lucide-react";
import { useAction, useQuery } from "convex/react";

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
import { useChatUIStore } from "../../stores/chat-ui-store";
import { api } from "../../../../../convex/_generated/api";

export const LearnChatSection = () => {
  const currentSessionId = useChatUIStore((state) => state.currentSessionId);
  const [isSending, setIsSending] = useState(false);

  const messages = useQuery(
    api.chat.queries.listMessages,
    currentSessionId ? { sessionId: currentSessionId } : "skip",
  );
  const sendMessage = useAction(api.chat.action.sendMessage);

  const handleSend = async (content: string) => {
    if (!currentSessionId) return;
    try {
      setIsSending(true);
      await sendMessage({ sessionId: currentSessionId, content });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full max-h-[600px] flex-col md:max-h-[650px]">
      <div className="flex items-center gap-x-2 border-b px-4 py-3">
        <SidebarTrigger />
        <BotIcon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">Assistant de la roadmap</p>
      </div>

      {!currentSessionId ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Préparation de votre session de discussion...
        </div>
      ) : (
        <MessageScrollerProvider autoScroll>
          <MessageScroller className="flex-1 px-4 py-4">
            <MessageScrollerViewport>
              <MessageScrollerContent>
                {messages?.map((message, index) => (
                  <MessageScrollerItem
                    key={message._id}
                    messageId={message._id}
                    scrollAnchor={index === (messages?.length ?? 0) - 1}
                  >
                    <ChatMessageItem
                      role={message.role}
                      content={message.content}
                      mermaid={message.mermaid}
                    />
                  </MessageScrollerItem>
                ))}
                {isSending && (
                  <MessageScrollerItem messageId={`${currentSessionId}-typing`}>
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
        disabled={isSending || !currentSessionId}
      />
    </div>
  );
};
