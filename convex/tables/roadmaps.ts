import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  roadmapStatusValidator,
  roadmapDataValidator,
} from "../roadmap/validators";

export const roadmaps = defineTable({
  userId: v.string(),
  topic: v.string(),
  status: roadmapStatusValidator,
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
