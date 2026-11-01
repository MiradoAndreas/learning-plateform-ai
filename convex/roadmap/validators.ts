import { v } from "convex/values";

export const roadmapStatusValidator = v.union(
  v.literal("draft"), // topic saved, questions not generated yet
  v.literal("generating_questions"), // action in flight
  v.literal("awaiting_answers"), // questions ready, user answering
  v.literal("generating_roadmap"), // action in flight
  v.literal("completed"), // title/summary/mermaid ready
  v.literal("failed"),
);

const roadmapRecommendationValidator = v.union(
  v.literal("recommended"),
  v.literal("alternative"),
  v.literal("none"),
);

const roadmapOptionValidator = v.object({
  id: v.string(),
  label: v.string(),
  recommendation: roadmapRecommendationValidator,
  note: v.optional(v.string()),
});

const roadmapTopicEntryValidator = v.object({
  kind: v.literal("topic"),
  id: v.string(),
  label: v.string(),
});

const roadmapChoiceEntryValidator = v.object({
  kind: v.literal("choice"),
  id: v.string(),
  label: v.string(),
  options: v.array(roadmapOptionValidator),
});

const roadmapEntryValidator = v.union(
  roadmapTopicEntryValidator,
  roadmapChoiceEntryValidator,
);

const roadmapCenterNodeValidator = v.object({
  id: v.string(),
  label: v.string(),
});

const roadmapSectionValidator = v.object({
  id: v.string(),
  title: v.string(),
  centerNodes: v.array(roadmapCenterNodeValidator),
  leftNodes: v.array(roadmapEntryValidator),
  rightNodes: v.array(roadmapEntryValidator),
});

export const roadmapDataValidator = v.object({
  title: v.string(),
  sections: v.array(roadmapSectionValidator),
});
