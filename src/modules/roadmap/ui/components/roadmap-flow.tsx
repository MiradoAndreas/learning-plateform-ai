"use client";

import {
  Controls,
  MiniMap,
  Node,
  ReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, type CSSProperties } from "react";
import { buildRoadmapFlow } from "../../lib/build-roadmap-flow";
import { RoadmapData } from "../../lib/roadmap-data-types";
import {
  CenterNode,
  ChoiceNode,
  OptionNode,
  SectionLabelNode,
  TopicNode,
} from "./roadmap-flow-nodes";

const nodeTypes: NodeTypes = {
  center: CenterNode,
  topic: TopicNode,
  choice: ChoiceNode,
  option: OptionNode,
  sectionLabel: SectionLabelNode,
};

const controlsStyle = {
  "--xy-controls-button-background-color": "var(--card)",
  "--xy-controls-button-background-color-hover": "var(--muted)",
  "--xy-controls-button-color": "var(--card-foreground)",
  "--xy-controls-button-color-hover": "var(--foreground)",
  "--xy-controls-button-border-color": "var(--border)",
} as CSSProperties;

type RoadmapFlowProps = {
  data: RoadmapData;
  onNodeClick?: (node: Node) => void;
  unlockedNodeIds: string[];
  completedNodeIds: string[];
};

export const RoadmapFlow = ({
  data,
  onNodeClick,
  unlockedNodeIds,
  completedNodeIds,
}: RoadmapFlowProps) => {
  const { nodes, edges } = useMemo(
    () =>
      buildRoadmapFlow(data, {
        unlockedNodeIds: new Set(unlockedNodeIds),
        completedNodeIds: new Set(completedNodeIds),
      }),
    [data, unlockedNodeIds, completedNodeIds],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => onNodeClick?.(node),
    [onNodeClick],
  );

  return (
    <div className="h-175 w-full overflow-hidden rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        onNodeClick={handleNodeClick}
      >
        <Controls showInteractive={false} style={controlsStyle} />
        {/* <MiniMap
          bgColor="var(--card)"
          nodeColor="var(--muted-foreground)"
          maskColor="color-mix(in oklch, var(--background) 65%, transparent)"
          className="border border-border"
        /> */}
      </ReactFlow>
    </div>
  );
};
