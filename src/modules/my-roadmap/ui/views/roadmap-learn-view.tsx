"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { ChatHistorySidebarSection } from "../sections/chat-history-sidebar-section";
import { RoadmapDisplaySection } from "../sections/roadmap-display-section";
import { LearnChatSection } from "../sections/learn-chat-section";
import { RoadmapProjectsSection } from "../sections/roadmap-projects-section";
import { useEnsureChatSession } from "../../hooks/use-ensure-session";
import { useEnsureRoadmapProjects } from "../../hooks/use-ensure-roadmap-projects";
import { Id } from "../../../../../convex/_generated/dataModel";
import { RoadmapNodeSelection } from "@/modules/roadmap/lib/roadmap-node-selection";

type RoadmapLearnViewProps = {
  roadmapId: Id<"roadmaps">;
};

type MobileTab = "roadmap" | "chat" | "projects";

export const RoadmapLearnView = ({ roadmapId }: RoadmapLearnViewProps) => {
  useEnsureChatSession(roadmapId);
  useEnsureRoadmapProjects(roadmapId);

  const [selectedNode, setSelectedNode] = useState<RoadmapNodeSelection | null>(
    null,
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>("roadmap");
  const isMobile = useIsMobile();

  const handleNodeClick = (node: RoadmapNodeSelection) => {
    setSelectedNode(node);
    if (isMobile) setMobileTab("chat");
  };

  return (
    <SidebarProvider>
      <SidebarInset>
        {isMobile ? (
          <div className="flex h-dvh flex-col">
            <div className="flex shrink-0 border-b">
              <button
                type="button"
                onClick={() => setMobileTab("roadmap")}
                className={cn(
                  "flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors",
                  mobileTab === "roadmap"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                Roadmap
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("chat")}
                className={cn(
                  "flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors",
                  mobileTab === "chat"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                Assistant
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("projects")}
                className={cn(
                  "flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors",
                  mobileTab === "projects"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                Projects
              </button>
            </div>

            <div
              className={cn(
                "min-h-0 flex-1",
                mobileTab !== "roadmap" && "hidden",
              )}
            >
              <RoadmapDisplaySection
                roadmapId={roadmapId}
                onNodeClick={handleNodeClick}
              />
            </div>
            <div
              className={cn("min-h-0 flex-1", mobileTab !== "chat" && "hidden")}
            >
              <LearnChatSection
                roadmapId={roadmapId}
                selectedNode={selectedNode}
              />
            </div>
            <div
              className={cn(
                "min-h-0 flex-1",
                mobileTab !== "projects" && "hidden",
              )}
            >
              <RoadmapProjectsSection roadmapId={roadmapId} />
            </div>
          </div>
        ) : (
          <div className="flex h-dvh flex-col">
            <ResizablePanelGroup
              orientation="vertical"
              className="min-h-0 flex-1"
            >
              <ResizablePanel defaultSize={75} minSize={40}>
                <ResizablePanelGroup
                  orientation="horizontal"
                  className="h-full"
                >
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <RoadmapDisplaySection
                      roadmapId={roadmapId}
                      onNodeClick={handleNodeClick}
                    />
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel defaultSize={50} minSize={30}>
                    <LearnChatSection
                      roadmapId={roadmapId}
                      selectedNode={selectedNode}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={25} minSize={15}>
                <RoadmapProjectsSection roadmapId={roadmapId} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        )}
      </SidebarInset>
      <ChatHistorySidebarSection roadmapId={roadmapId} />
    </SidebarProvider>
  );
};
