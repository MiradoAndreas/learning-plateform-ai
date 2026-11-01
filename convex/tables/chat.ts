import { defineTable } from "convex/server";
import { v } from "convex/values";

export const roadmapThreads = defineTable({
  roadmapId: v.id("roadmaps"),
  userId: v.string(),
  threadId: v.string(),
  title: v.string(),
  messageCount: v.optional(v.number()),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_thread", ["threadId"]);
