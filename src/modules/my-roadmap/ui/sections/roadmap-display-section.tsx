"use client";

import { GeneratingIndicator } from "@/modules/roadmap/ui/components/generating-indicator";
import { RoadmapErrorAlert } from "@/modules/roadmap/ui/components/roadmap-error-alert";
import { useQuery } from "convex/react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { RoadmapFlow } from "@/modules/roadmap/ui/components/roadmap-flow";

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

  if (!roadmap.roadmapData) {
    return <GeneratingIndicator label="Roadmap en cours de génération..." />;
  }

  return (
    <div className="flex h-full flex-col gap-y-4 overflow-auto p-6">
      <div className="flex-1">
        <RoadmapFlow data={roadmap.roadmapData} />
      </div>
    </div>
  );
};
