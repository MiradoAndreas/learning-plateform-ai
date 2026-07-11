"use client";

import { ZoomableDiagramSvg } from "@/components/zoomable-diagram";
import { GeneratingIndicator } from "@/modules/roadmap/ui/components/generating-indicator";
import { RoadmapStatusBadge } from "@/modules/roadmap/ui/components/my-roadmap-status-badge";
import { RoadmapErrorAlert } from "@/modules/roadmap/ui/components/roadmap-error-alert";
import { useQuery } from "convex/react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

type RoadmapDisplaySectionProps = {
  roadmapId: Id<"roadmaps">;
};

export const RoadmapDisplaySection = ({
  roadmapId,
}: RoadmapDisplaySectionProps) => {
  const roadmap = useQuery(api.roadmap.queries.getRoadmap, { roadmapId });

  if (roadmap === undefined) {
    return <GeneratingIndicator label="Chargement de la roadmap..." />;
  }

  if (roadmap.status === "failed") {
    return (
      <RoadmapErrorAlert
        message={roadmap.errorMessage ?? "Une erreur est survenue"}
      />
    );
  }

  if (!roadmap.mermaid) {
    return <GeneratingIndicator label="Roadmap en cours de génération..." />;
  }

  return (
    <div className="flex h-full flex-col gap-y-4 overflow-auto p-6">
      <div className="flex-1">
        <ZoomableDiagramSvg chart={roadmap.mermaid} />
      </div>
    </div>
  );
};
