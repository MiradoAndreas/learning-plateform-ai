"use client";

import { useQuery } from "convex/react";

import { ZoomableDiagramSvg } from "@/components/zoomable-diagram";

import { GeneratingIndicator } from "../components/generating-indicator";
import { RoadmapErrorAlert } from "../components/roadmap-error-alert";
import { useRoadmapStore } from "../../stores/roadmap-store";
import { api } from "../../../../../convex/_generated/api";

export const ResultRoadmapSection = () => {
  const roadmapId = useRoadmapStore((state) => state.roadmapId);

  const roadmap = useQuery(
    api.roadmap.queries.getRoadmap,
    roadmapId ? { roadmapId } : "skip",
  );

  if (!roadmap) return null;

  if (roadmap.status === "generating_roadmap") {
    return <GeneratingIndicator label="Génération de votre roadmap..." />;
  }

  if (roadmap.status === "failed") {
    return (
      <RoadmapErrorAlert
        message={roadmap.errorMessage ?? "Une erreur est survenue"}
      />
    );
  }

  if (roadmap.status !== "completed" || !roadmap.mermaid) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-2">
      {roadmap.title && (
        <h2 className="text-xl font-semibold">{roadmap.title}</h2>
      )}
      {roadmap.summary && (
        <p className="text-sm text-muted-foreground">{roadmap.summary}</p>
      )}
      <ZoomableDiagramSvg chart={roadmap.mermaid} />
    </div>
  );
};
