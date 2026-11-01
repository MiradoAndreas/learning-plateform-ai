"use client";

import Link from "next/link";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useEnsureRoadmapProjects } from "../../hooks/use-ensure-roadmap-projects";
import { RoadmapProjectsSection } from "../sections/roadmap-projects-section";

type RoadmapProjectsViewProps = {
  roadmapId: Id<"roadmaps">;
};

export const RoadmapProjectsView = ({
  roadmapId,
}: RoadmapProjectsViewProps) => {
  useEnsureRoadmapProjects(roadmapId);

  return (
    <div className="flex h-dvh flex-col">
      <div className="shrink-0 border-b px-4 py-2">
        <Link
          href={`/dashboard/ai/library/roadmap/${roadmapId}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to roadmap
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <RoadmapProjectsSection roadmapId={roadmapId} />
      </div>
    </div>
  );
};
