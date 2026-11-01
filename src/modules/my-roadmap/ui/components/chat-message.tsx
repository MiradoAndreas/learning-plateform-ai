import { BotIcon } from "lucide-react";
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
};

export const ChatMessageItem = ({ role, content }: ChatMessageItemProps) => {
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
        <Bubble variant={isUser ? "muted" : undefined} className="w-full max-w-full">
          <BubbleContent className="w-full">
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
};
