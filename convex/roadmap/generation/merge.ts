import type { RoadmapSkeleton } from "./phaseSkeleton";
import type { PhaseDetail } from "./phaseDetails";
import type { GapAudit } from "./gapAudit";
import type { ChoicePass } from "./choicePass";
import {
  RoadmapData,
  RoadmapEntry,
  RoadmapSection,
} from "@/modules/roadmap/lib/roadmap-data-types";

function dedupeId(id: string, seen: Set<string>): string {
  if (!seen.has(id)) {
    seen.add(id);
    return id;
  }
  let suffix = 2;
  while (seen.has(`${id}-${suffix}`)) suffix += 1;
  const uniqueId = `${id}-${suffix}`;
  seen.add(uniqueId);
  return uniqueId;
}

export function mergeRoadmap({
  skeleton,
  details,
  gapAudit,
  choicePass,
}: {
  skeleton: RoadmapSkeleton;
  details: Record<string, PhaseDetail>;
  gapAudit: GapAudit;
  choicePass: ChoicePass;
}): RoadmapData {
  const seenIds = new Set<string>();
  const replacementByEntryId = new Map(
    choicePass.replacements.map((r) => [r.entryId, r]),
  );

  const sections: RoadmapSection[] = skeleton.phases.map((phase) => {
    const detail = details[phase.id];

    const toEntry = (topic: { id: string; label: string }): RoadmapEntry => {
      const replacement = replacementByEntryId.get(topic.id);
      const id = dedupeId(topic.id, seenIds);

      if (replacement) {
        return {
          kind: "choice",
          id,
          label: replacement.label,
          options: replacement.options,
        };
      }
      return { kind: "topic", id, label: topic.label };
    };

    const leftNodes = detail.leftNodes.map(toEntry);
    const rightNodes = detail.rightNodes.map(toEntry);

    for (const addition of gapAudit.additions) {
      if (addition.targetPhaseId !== phase.id) continue;
      const target = addition.side === "left" ? leftNodes : rightNodes;
      for (const entry of addition.entries) {
        target.push({
          kind: "topic",
          id: dedupeId(entry.id, seenIds),
          label: entry.label,
        });
      }
    }

    return {
      id: phase.id,
      title: phase.title,
      centerNodes: detail.centerNodes.map((n) => ({
        id: dedupeId(n.id, seenIds),
        label: n.label,
      })),
      leftNodes,
      rightNodes,
    };
  });

  return { title: skeleton.title, sections };
}
