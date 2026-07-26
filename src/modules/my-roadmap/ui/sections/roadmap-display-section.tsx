"use client";

import { GeneratingIndicator } from "@/modules/roadmap/ui/components/generating-indicator";
import { Node } from "@xyflow/react";
import { RoadmapErrorAlert } from "@/modules/roadmap/ui/components/roadmap-error-alert";
import { useQuery } from "convex/react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import dynamic from "next/dynamic";

const RoadmapFlow = dynamic(
  () =>
    import("@/modules/roadmap/ui/components/roadmap-flow").then(
      (mod) => mod.RoadmapFlow,
    ),
  {
    ssr: false,
    loading: () => <GeneratingIndicator label="Chargement du diagramme..." />,
  },
);

type RoadmapDisplaySectionProps = {
  roadmapId: Id<"roadmaps">;
  onNodeClick: (node: Node) => void;
};

export const RoadmapDisplaySection = ({
  roadmapId,
  onNodeClick,
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
    <div className="flex h-full flex-col gap-y-4 overflow-auto p-3 sm:p-6">
      <div className="flex-1">
        <RoadmapFlow data={roadmap.roadmapData} onNodeClick={onNodeClick} />
      </div>
    </div>
  );
};
