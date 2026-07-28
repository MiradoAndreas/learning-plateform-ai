import type { Node, Edge } from "@xyflow/react";
import type { RoadmapData, RoadmapEntry } from "./roadmap-data-types";

const CENTER_X = 420;
const SIDE_OFFSET = 300;
const CHOICE_OPTION_OFFSET = 260;
const ROW_HEIGHT = 56;
const CENTER_NODE_HEIGHT = 46;
const CENTER_NODE_GAP = 10;
const TOPIC_NODE_HEIGHT = 36;
const OPTION_NODE_HEIGHT = 48;
const SECTION_LABEL_HEIGHT = 32;
const SECTION_GAP = 50;
const TOP_PADDING = 40;

type Side = "left" | "right";

type ProgressInfo = {
  unlockedNodeIds: Set<string>;
  completedNodeIds: Set<string>;
};

function isChoice(
  entry: RoadmapEntry,
): entry is Extract<RoadmapEntry, { kind: "choice" }> {
  return entry.kind === "choice";
}

function rowsForEntry(entry: RoadmapEntry): number {
  if (!isChoice(entry)) {
    return 1;
  }
  return Math.max(entry.options?.length ?? 0, 1);
}

function placeColumn({
  entries,
  side,
  columnRows,
  contentHeight,
  sectionTopY,
  hubCenterId,
  progress,
  nodes,
  edges,
}: {
  entries: RoadmapEntry[];
  side: Side;
  columnRows: number;
  contentHeight: number;
  sectionTopY: number;
  hubCenterId: string | null;
  progress: ProgressInfo;
  nodes: Node[];
  edges: Edge[];
}) {
  const columnHeight = columnRows * ROW_HEIGHT;
  const columnStartY = sectionTopY + (contentHeight - columnHeight) / 2;

  const hubX =
    side === "left" ? CENTER_X - SIDE_OFFSET : CENTER_X + SIDE_OFFSET;

  const sourceHandle = side === "left" ? "source-left" : "source-right";
  const hubTargetHandle = side === "left" ? "target-right" : "target-left";

  let rowCursor = 0;

  for (const entry of entries) {
    const span = rowsForEntry(entry);
    const spanTopY = columnStartY + rowCursor * ROW_HEIGHT;
    const spanCenterY = spanTopY + (span * ROW_HEIGHT) / 2;

    if (isChoice(entry)) {
      const choiceLocked = !progress.unlockedNodeIds.has(entry.id);
      const choiceCompleted = progress.completedNodeIds.has(entry.id);

      nodes.push({
        id: entry.id,
        type: "choice",
        position: {
          x: hubX,
          y: spanCenterY - TOPIC_NODE_HEIGHT / 2,
        },
        data: {
          label: entry.label,
          locked: choiceLocked,
          completed: choiceCompleted,
        },
        draggable: false,
      });

      if (hubCenterId) {
        edges.push({
          id: `edge-${entry.id}`,
          source: hubCenterId,
          sourceHandle,
          target: entry.id,
          targetHandle: hubTargetHandle,
          type: "bezier",
          style: {
            stroke: choiceLocked ? "#cbd5e1" : "#60a5fa",
            strokeDasharray: "3 4",
          },
        });
      }

      const optionX =
        side === "left"
          ? hubX - CHOICE_OPTION_OFFSET
          : hubX + CHOICE_OPTION_OFFSET;

      const optionSourceHandle =
        side === "left" ? "source-left" : "source-right";
      const optionTargetHandle =
        side === "left" ? "target-right" : "target-left";

      const options = entry.options ?? [];

      options.forEach((option, index) => {
        const optionY =
          spanTopY +
          index * ROW_HEIGHT +
          ROW_HEIGHT / 2 -
          OPTION_NODE_HEIGHT / 2;

        nodes.push({
          id: option.id,
          type: "option",
          position: { x: optionX, y: optionY },
          data: {
            label: option.label,
            recommendation: option.recommendation,
            note: option.note,
            side,
            // Hérite du verrouillage du "choice" parent : pas de quiz propre.
            locked: choiceLocked,
          },
          draggable: false,
        });

        edges.push({
          id: `choice-edge-${option.id}`,
          source: entry.id,
          sourceHandle: optionSourceHandle,
          target: option.id,
          targetHandle: optionTargetHandle,
          type: "bezier",
          style: {
            stroke: choiceLocked
              ? "#e2e8f0"
              : option.recommendation === "recommended"
                ? "#22c55e"
                : "#cbd5e1",
            strokeWidth:
              !choiceLocked && option.recommendation === "recommended" ? 2 : 1,
          },
        });
      });
    } else {
      const locked = !progress.unlockedNodeIds.has(entry.id);
      const completed = progress.completedNodeIds.has(entry.id);

      nodes.push({
        id: entry.id,
        type: "topic",
        position: { x: hubX, y: spanCenterY - TOPIC_NODE_HEIGHT / 2 },
        data: { label: entry.label, side, locked, completed },
        draggable: false,
      });

      if (hubCenterId) {
        edges.push({
          id: `edge-${entry.id}`,
          source: hubCenterId,
          sourceHandle,
          target: entry.id,
          targetHandle: hubTargetHandle,
          type: "bezier",
          style: {
            stroke: locked ? "#cbd5e1" : "#60a5fa",
            strokeDasharray: "3 4",
          },
        });
      }
    }

    rowCursor += span;
  }
}

export function buildRoadmapFlow(
  data: RoadmapData,
  progress: ProgressInfo,
): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let y = TOP_PADDING;
  let previousLastCenterId: string | null = null;

  for (const section of data.sections) {
    nodes.push({
      id: `label-${section.id}`,
      type: "sectionLabel",
      position: { x: CENTER_X - 90, y },
      data: { label: section.title },
      draggable: false,
      selectable: false,
    });
    y += SECTION_LABEL_HEIGHT;

    const leftRows = section.leftNodes.reduce(
      (sum, e) => sum + rowsForEntry(e),
      0,
    );
    const rightRows = section.rightNodes.reduce(
      (sum, e) => sum + rowsForEntry(e),
      0,
    );
    const contentRows = Math.max(leftRows, rightRows, 1);
    const contentHeight = contentRows * ROW_HEIGHT;

    const centerBlockHeight =
      section.centerNodes.length * CENTER_NODE_HEIGHT +
      (section.centerNodes.length - 1) * CENTER_NODE_GAP;
    const centerStartY = y + (contentHeight - centerBlockHeight) / 2;

    let previousCenterId: string | null = previousLastCenterId;
    section.centerNodes.forEach((node, index) => {
      const nodeY =
        centerStartY + index * (CENTER_NODE_HEIGHT + CENTER_NODE_GAP);
      nodes.push({
        id: node.id,
        type: "center",
        position: { x: CENTER_X, y: nodeY },
        data: { label: node.label },
        draggable: false,
      });
      if (previousCenterId) {
        edges.push({
          id: `spine-${previousCenterId}-${node.id}`,
          source: previousCenterId,
          sourceHandle: "source-bottom",
          target: node.id,
          targetHandle: "target-top",
          type: "straight",
          style: { stroke: "#93c5fd", strokeDasharray: "4 4" },
        });
      }
      previousCenterId = node.id;
    });

    const firstCenterId: string | null =
      section.centerNodes[0]?.id ?? previousLastCenterId;
    const lastCenterId: string | null =
      section.centerNodes.at(-1)?.id ?? firstCenterId;

    placeColumn({
      entries: section.leftNodes,
      side: "left",
      columnRows: leftRows,
      contentHeight,
      sectionTopY: y,
      hubCenterId: firstCenterId,
      progress,
      nodes,
      edges,
    });

    placeColumn({
      entries: section.rightNodes,
      side: "right",
      columnRows: rightRows,
      contentHeight,
      sectionTopY: y,
      hubCenterId: lastCenterId,
      progress,
      nodes,
      edges,
    });

    previousLastCenterId = lastCenterId ?? previousLastCenterId;
    y += contentHeight + SECTION_GAP;
  }

  return { nodes, edges };
}
// mmm
