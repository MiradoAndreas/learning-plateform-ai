import { defineTable } from "convex/server";
import { v } from "convex/values";

export const roadmapStatus = v.union(
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

export const roadmaps = defineTable({
  userId: v.string(),
  topic: v.string(),
  status: roadmapStatus,
  title: v.optional(v.string()),
  summary: v.optional(v.string()),
  roadmapData: v.optional(roadmapDataValidator), // remplace `mermaid`
  errorMessage: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_user_and_status", ["userId", "status"]);

export const roadmapQuestions = defineTable({
  roadmapId: v.id("roadmaps"),
  order: v.number(),
  key: v.string(),
  title: v.string(),
  description: v.union(v.string(), v.null()),
  required: v.boolean(),
  options: v.array(v.string()),
  answer: v.optional(v.string()),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_roadmap_and_order", ["roadmapId", "order"])
  .index("by_roadmap_and_key", ["roadmapId", "key"]);

export const roadmapThreads = defineTable({
  roadmapId: v.id("roadmaps"),
  userId: v.string(),
  threadId: v.string(),
  title: v.string(),
  messageCount: v.optional(v.number()),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_thread", ["threadId"]);

export const submissionStatusValidator = v.union(
  v.literal("uploaded"),
  v.literal("extracting"),
  v.literal("reviewing"),
  v.literal("completed"),
  v.literal("failed"),
);

export const roadmapProjectSubmissions = defineTable({
  roadmapId: v.id("roadmaps"),
  projectId: v.id("roadmapProjects"),
  userId: v.string(),
  storageId: v.id("_storage"),
  fileName: v.string(),
  status: submissionStatusValidator,
  score: v.optional(v.number()),
  passed: v.optional(v.boolean()),
  summary: v.optional(v.string()),
  strengths: v.optional(v.array(v.string())),
  improvements: v.optional(v.array(v.string())),
  meetsObjectives: v.optional(v.boolean()),
  errorMessage: v.optional(v.string()),
  // Transparence sur la couverture réelle de l'analyse.
  totalFilesInProject: v.optional(v.number()),
  totalFilesAnalyzed: v.optional(v.number()),
  totalBatches: v.optional(v.number()),
  truncated: v.optional(v.boolean()), // true si le plafond de sécurité a été atteint
  submittedAt: v.number(),
  reviewedAt: v.optional(v.number()),
})
  .index("by_project", ["projectId"])
  .index("by_project_and_user", ["projectId", "userId"])
  .index("by_roadmap_and_user", ["roadmapId", "userId"]);

export const roadmapSubmissionFileBatches = defineTable({
  submissionId: v.id("roadmapProjectSubmissions"),
  batchIndex: v.number(),
  filePaths: v.array(v.string()),
  content: v.string(), // contenu brut concaténé du lot, servi à l'analyse
  filesReviewed: v.optional(v.array(v.string())),
  observations: v.optional(v.array(v.string())),
  notableIssues: v.optional(v.array(v.string())),
  analyzed: v.boolean(),
}).index("by_submission", ["submissionId"]);
