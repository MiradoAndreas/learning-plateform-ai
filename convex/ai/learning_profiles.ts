import { defineTable } from "convex/server";
import { v } from "convex/values";

export const learningProfiles = defineTable({
  userId: v.string(),

  // Profile version for schema evolution
  version: v.number(),

  // Current learning context
  currentRoadmapId: v.optional(v.string()),
  currentLearningStage: v.optional(v.string()),

  // Adaptive learning parameters
  adaptiveDifficulty: v.optional(v.number()),
  contentDifficulty: v.optional(v.number()),
  recommendationConfidence: v.optional(v.number()),

  // Learning patterns
  averageSessionDuration: v.optional(v.number()),
  preferredContentTypes: v.optional(v.array(v.string())),
  optimalLearningTime: v.optional(v.string()),

  // AI interaction history
  lastAiInteractionAt: v.optional(v.number()),
  totalAiInteractions: v.optional(v.number()),

  // Personalization vectors (future: embeddings)
  learningStyleVector: v.optional(v.array(v.number())),
  interestVector: v.optional(v.array(v.number())),

  // Performance metrics
  retentionRate: v.optional(v.number()),
  engagementScore: v.optional(v.number()),

  // Metadata
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_user_and_active", ["userId", "isActive"])
  .index("by_last_interaction", ["lastAiInteractionAt"]);
