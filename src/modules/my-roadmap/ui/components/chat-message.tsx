import { BotIcon } from "lucide-react";
import { Streamdown } from "streamdown";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import "katex/dist/katex.min.css";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";

type ChatMessageItemProps = {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

export const ChatMessageItem = ({
  role,
  content,
  isStreaming = false,
}: ChatMessageItemProps) => {
  const isUser = role === "user";

  return (
    <Message className="flex-col items-center">
      {!isUser && (
        <MessageAvatar className="self-start">
          <Avatar>
            <AvatarFallback>
              <BotIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
      )}
      <MessageContent>
        {isUser ? (
          <Bubble variant="muted" className="w-full max-w-full">
            <BubbleContent className="w-full">
              <p className="text-sm whitespace-pre-wrap">{content}</p>
            </BubbleContent>
          </Bubble>
        ) : (
          <Streamdown
            plugins={{ math, mermaid }}
            className="learn-chat-response min-w-0 bg-transparent text-sm leading-7 text-white"
            isAnimating={isStreaming}
          >
            {content}
          </Streamdown>
        )}
      </MessageContent>
    </Message>
  );
};
