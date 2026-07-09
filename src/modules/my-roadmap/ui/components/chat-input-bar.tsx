"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputBarProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export const ChatInputBar = ({ onSend, disabled }: ChatInputBarProps) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="flex items-end gap-x-2 border-t p-3">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
          }
        }}
        placeholder="Posez une question sur cette étape..."
        className="min-h-[50px] resize-none"
        disabled={disabled}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={disabled}
        aria-label="Envoyer"
      >
        <SendIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
