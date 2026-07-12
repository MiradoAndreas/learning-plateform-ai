"use client";

import { PlusIcon } from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { ChatHistoryItem } from "../components/chat-history-item";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { useChatUIStore } from "../../stores/chat-ui-store";

type ChatHistorySidebarSectionProps = {
  roadmapId: Id<"roadmaps">;
};

export const ChatHistorySidebarSection = ({
  roadmapId,
}: ChatHistorySidebarSectionProps) => {
  const sessions = useQuery(api.chat.queries.listSessions, { roadmapId });
  const currentThreadId = useChatUIStore((state) => state.currentThreadId);
  const setCurrentThreadId = useChatUIStore(
    (state) => state.setCurrentThreadId,
  );
  const createSession = useMutation(api.chat.mutation.createSession);

  const handleCreateSession = async () => {
    const threadId = await createSession({ roadmapId });
    setCurrentThreadId(threadId);
  };

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="p-3">
        <Button
          className="w-full justify-start gap-x-2"
          variant="outline"
          onClick={handleCreateSession}
        >
          <PlusIcon className="h-4 w-4" />
          Nouvelle discussion
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Historique</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions?.map((session) => (
                <ChatHistoryItem
                  key={session._id}
                  title={session.title}
                  active={session.threadId === currentThreadId}
                  onClick={() => setCurrentThreadId(session.threadId)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
