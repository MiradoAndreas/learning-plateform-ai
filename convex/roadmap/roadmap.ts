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

export const roadmaps = defineTable({
  userId: v.string(),
  topic: v.string(),
  status: roadmapStatus,
  title: v.optional(v.string()),
  summary: v.optional(v.string()),
  mermaid: v.optional(v.string()),
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
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_thread", ["threadId"]);
