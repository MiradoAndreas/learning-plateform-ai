"use client";

import { useQuery } from "convex/react";

import { GeneratingIndicator } from "../components/generating-indicator";
import { RoadmapErrorAlert } from "../components/roadmap-error-alert";
import { useRoadmapStore } from "../../stores/roadmap-store";
import { api } from "../../../../../convex/_generated/api";
import { RoadmapFlow } from "../components/roadmap-flow";

const EMPTY_NODE_IDS: string[] = [];

export const ResultRoadmapSection = () => {
  const roadmapId = useRoadmapStore((state) => state.roadmapId);

  const roadmap = useQuery(
    api.roadmap.queries.getRoadmap,
    roadmapId ? { roadmapId } : "skip",
  );
  const progress = useQuery(
    api.roadmap.queries.getRoadmapProgress,
    roadmapId ? { roadmapId } : "skip",
  );

  if (!roadmap) return null;

  if (roadmap.status === "failed") {
    return (
      <RoadmapErrorAlert
        message={roadmap.errorMessage ?? "Une erreur est survenue"}
      />
    );
  }

  const isGenerating = roadmap.status === "generating_roadmap";
  if (!isGenerating && roadmap.status !== "completed") return null;

  return (
    <div className="flex flex-col gap-y-2" aria-busy={isGenerating}>
      {isGenerating && (
        <GeneratingIndicator label="Génération de votre roadmap..." />
      )}
      {roadmap.roadmapData && roadmap.roadmapData.sections.length > 0 && (
        <RoadmapFlow
          key={roadmapId}
          data={roadmap.roadmapData}
          unlockedNodeIds={progress?.unlockedNodeIds ?? EMPTY_NODE_IDS}
          completedNodeIds={progress?.completedNodeIds ?? EMPTY_NODE_IDS}
        />
      )}
    </div>
  );
};
