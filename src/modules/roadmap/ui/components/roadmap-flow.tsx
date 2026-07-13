"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  CenterNode,
  TopicNode,
  ChoiceNode,
  OptionNode,
  SectionLabelNode,
} from "./roadmap-flow-nodes";
import { buildRoadmapFlow } from "../../lib/build-roadmap-flow";
import { RoadmapData } from "../../lib/roadmap-data-types";

const nodeTypes: NodeTypes = {
  center: CenterNode,
  topic: TopicNode,
  choice: ChoiceNode,
  option: OptionNode,
  sectionLabel: SectionLabelNode,
};

type RoadmapFlowProps = {
  data: RoadmapData;
};

export const RoadmapFlow = ({ data }: RoadmapFlowProps) => {
  const { nodes, edges } = useMemo(() => buildRoadmapFlow(data), [data]);

  return (
    <div className="h-[700px] w-full overflow-hidden rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
