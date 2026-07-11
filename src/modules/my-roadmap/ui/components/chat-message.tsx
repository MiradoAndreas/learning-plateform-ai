import { BotIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import { ZoomableDiagramSvg } from "@/components/zoomable-diagram";

type ChatMessageItemProps = {
  role: "user" | "assistant";
  content: string;
  mermaid?: string;
};

export const ChatMessageItem = ({
  role,
  content,
  mermaid,
}: ChatMessageItemProps) => {
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
          <BubbleContent className="flex flex-col gap-y-3">
            <p className="text-sm whitespace-pre-wrap">{content}</p>
            {mermaid && (
              <div className="overflow-hidden rounded-md border bg-background">
                <ZoomableDiagramSvg chart={mermaid} />
              </div>
            )}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
};
