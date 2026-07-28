"use client";

import dynamic from "next/dynamic";
import { Node } from "@xyflow/react";
import { useQuery } from "convex/react";
import { GeneratingIndicator } from "@/modules/roadmap/ui/components/generating-indicator";
import { RoadmapErrorAlert } from "@/modules/roadmap/ui/components/roadmap-error-alert";

import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { useQuizUIStore } from "@/modules/roadmap/stores/quiz-ui-store";
import { NodeActionDialog } from "@/modules/roadmap/ui/components/node-action-dialog";
import { RoadmapNodeSelection } from "@/modules/roadmap/lib/roadmap-node-selection";

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
  onNodeClick: (node: RoadmapNodeSelection) => void;
};

export const RoadmapDisplaySection = ({
  roadmapId,
  onNodeClick,
}: RoadmapDisplaySectionProps) => {
  const roadmap = useQuery(api.roadmap.queries.getRoadmap, { roadmapId });
  const progress = useQuery(api.roadmap.queries.getRoadmapProgress, {
    roadmapId,
  });
  const openNodeMenu = useQuizUIStore((s) => s.openNodeMenu);

  if (roadmap === undefined || progress === undefined) {
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

  const completedSet = new Set(progress.completedNodeIds);

  const handleNodeClick = (node: Node) => {
    const locked = Boolean(node.data.locked);
    if (locked) return;

    if (node.type === "topic" || node.type === "choice") {
      const label = String(node.data.label ?? "");

      if (completedSet.has(node.id)) {
        // Déjà validé : plus besoin du menu, on va direct à l'explication.
        onNodeClick(node);
        return;
      }

      openNodeMenu(node.id, label);
      return;
    }

    // "option" et "center" : jamais gatés, comportement normal
    onNodeClick(node);
  };

  return (
    <div className="flex h-full flex-col gap-y-4 overflow-auto p-3 sm:p-6">
      <div className="flex-1">
        <RoadmapFlow
          data={roadmap.roadmapData}
          onNodeClick={handleNodeClick}
          unlockedNodeIds={progress.unlockedNodeIds}
          completedNodeIds={progress.completedNodeIds}
        />
      </div>
      <NodeActionDialog
        roadmapId={roadmapId}
        onLearn={(nodeId, nodeLabel) =>
          onNodeClick({ id: nodeId, data: { label: nodeLabel } })
        }
      />
    </div>
  );
};
