"use client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { ChatHistorySidebarSection } from "../sections/chat-history-sidebar-section";
import { RoadmapDisplaySection } from "../sections/roadmap-display-section";
import { LearnChatSection } from "../sections/learn-chat-section";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useEnsureChatSession } from "../../stores/use-ensure-chat-session";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

type RoadmapLearnViewProps = {
  roadmapId: Id<"roadmaps">;
};

export const RoadmapLearnView = ({ roadmapId }: RoadmapLearnViewProps) => {
  useEnsureChatSession(roadmapId);

  return (
    <SidebarProvider>
      <SidebarInset>
        <ResizablePanelGroup orientation="horizontal" className="h-screen">
          <ResizablePanel defaultSize={50} minSize={30}>
            <RoadmapDisplaySection roadmapId={roadmapId} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <LearnChatSection />
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
      <ChatHistorySidebarSection roadmapId={roadmapId} />
    </SidebarProvider>
  );
};
