"use client";

import { useRef, useState } from "react";
import { MessageSquareIcon, PencilIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatHistoryItemProps = {
  title: string;
  active: boolean;
  onClick: () => void;
  onRename: (newTitle: string) => void;
};

export const ChatHistoryItem = ({
  title,
  active,
  onClick,
  onRename,
}: ChatHistoryItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const startEditing = () => {
    setDraftTitle(title);
    setIsEditing(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const commitRename = () => {
    const trimmed = draftTitle.trim();

    setIsEditing(false);

    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    } else {
      setDraftTitle(title);
    }
  };

  const cancelRename = () => {
    setDraftTitle(title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitRename();
          }

          if (e.key === "Escape") {
            e.preventDefault();
            cancelRename();
          }
        }}
        className="w-full bg-transparent text-sm outline-none"
      />
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onClick();
        }
      }}
      onDoubleClick={startEditing}
      className={cn(
        `group/item flex w-full cursor-pointer items-center gap-x-2 rounded-full px-4 py-2`,
        active && "bg-primary",
      )}
    >
      <MessageSquareIcon className="h-4 w-4 shrink-0 text-muted-foreground" />

      <span className="flex-1 truncate text-sm">{title}</span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          startEditing();
        }}
        className="shrink-0 opacity-0 transition-opacity group-hover/item:opacity-100"
        aria-label="Renommer la discussion"
      >
        <PencilIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
