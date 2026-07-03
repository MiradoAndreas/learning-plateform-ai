import { defineTable } from "convex/server";
import { v } from "convex/values";

export const interests = defineTable({
  userId: v.string(),

  // Hierarchical interest classification
  domain: v.string(), // e.g., "Computer Science"
  subdomain: v.optional(v.string()), // e.g., "Machine Learning"
  topic: v.string(), // e.g., "Neural Networks"

  // Specific technologies or skills
  technologies: v.optional(v.array(v.string())),

  // Interest level
  proficiency: v.union(
    v.literal("exploring"),
    v.literal("beginner"),
    v.literal("intermediate"),
    v.literal("advanced"),
    v.literal("expert"),
  ),

  // Priority for learning roadmap
  priority: v.optional(v.number()),

  // AI metadata
  relevanceScore: v.optional(v.number()),
  lastExploredAt: v.optional(v.number()),

  // Metadata
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_user_and_domain", ["userId", "domain"])
  .index("by_user_and_proficiency", ["userId", "proficiency"]);
