import type { Doc } from "../../_generated/dataModel";
import type { Infer } from "convex/values";
import type { roadmapDataValidator } from "../validators";

type RoadmapData = Infer<typeof roadmapDataValidator>;

export function getOrderedNodeIds(roadmapData: RoadmapData): string[] {
  return roadmapData.sections.flatMap((section) => [
    ...section.leftNodes.map((n) => n.id),
    ...section.rightNodes.map((n) => n.id),
  ]);
}

export function toClientQuiz(
  quizId: string,
  questions: Doc<"roadmapNodeQuizzes">["questions"],
) {
  return {
    quizId,
    questions: questions.map(({ question, options }) => ({
      question,
      options,
    })),
  };
}

export function getUnlockedNodeIds(
  orderedNodeIds: string[],
  completedNodeIds: ReadonlySet<string>,
) {
  const unlockedNodeIds: string[] = [];
  for (let i = 0; i < orderedNodeIds.length; i++) {
    const nodeId = orderedNodeIds[i];
    const isFirst = i === 0;
    const previousCompleted =
      i > 0 && completedNodeIds.has(orderedNodeIds[i - 1]);
    if (isFirst || previousCompleted || completedNodeIds.has(nodeId))
      unlockedNodeIds.push(nodeId);
    else break;
  }
  return unlockedNodeIds;
}
