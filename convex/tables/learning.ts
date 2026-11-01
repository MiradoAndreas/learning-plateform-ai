import { defineTable } from "convex/server";
import { v } from "convex/values";

export const learningMemories = defineTable({
  userId: v.string(),
  topic: v.string(),
  depth: v.number(),
  pace: v.union(v.literal("slow"), v.literal("normal"), v.literal("fast")),
  feedback: v.union(
    v.literal("understood"),
    v.literal("struggling"),
    v.literal("deeper"),
    v.literal("pace"),
  ),
  evidence: v.string(),
  understoodCount: v.number(),
  difficultyCount: v.number(),
  source: v.string(),
  updatedAt: v.number(),
})
  .index("by_user_topic", ["userId", "topic"])
  .index("by_user_updated", ["userId", "updatedAt"]);
