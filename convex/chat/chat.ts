import { defineTable } from "convex/server";
import { v } from "convex/values";

// convex/schema.ts (ajout)
export const chatSessions = defineTable({
  roadmapId: v.id("roadmaps"),
  userId: v.string(),
  title: v.string(),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_user", ["userId"]);

export const chatMessages = defineTable({
  sessionId: v.id("chat_sessions"),
  roadmapId: v.id("roadmaps"),
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
}).index("by_session", ["sessionId"]);
