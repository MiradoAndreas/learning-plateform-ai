import { BotIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import { ChatRole } from "../../stores/learn-chat-store";

type ChatMessageItemProps = {
  role: ChatRole;
  content: string;
};

export const ChatMessageItem = ({ role, content }: ChatMessageItemProps) => {
  const isUser = role === "user";

  return (
    <Message
      align={isUser ? "end" : "start"}
      className={isUser ? "pr-4" : undefined}
    >
      {!isUser && (
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>
              <BotIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
      )}
      <MessageContent>
        <Bubble variant={isUser ? "muted" : undefined}>
          <BubbleContent>
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
};
