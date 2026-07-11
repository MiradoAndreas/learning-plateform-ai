"use client";

import { MessageSquareIcon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

type ChatHistoryItemProps = {
  title: string;
  active: boolean;
  onClick: () => void;
};

export const ChatHistoryItem = ({
  title,
  active,
  onClick,
}: ChatHistoryItemProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={active} onClick={onClick}>
        <MessageSquareIcon className="h-4 w-4" />
        <span className="truncate">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
