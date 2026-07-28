// convex/roadmap/progress.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const quizQuestionValidator = v.object({
  question: v.string(),
  options: v.array(v.string()),
  correctIndex: v.number(),
});

// Quiz généré une seule fois par nœud (mis en cache, jamais régénéré)
export const roadmapNodeQuizzes = defineTable({
  roadmapId: v.id("roadmaps"),
  nodeId: v.string(),
  questions: v.array(quizQuestionValidator),
}).index("by_roadmap_and_node", ["roadmapId", "nodeId"]);

// Seuls les nœuds RÉUSSIS sont stockés — le verrouillage des autres
// se déduit de l'ordre canonique, pas d'un état "locked" à maintenir.
export const roadmapNodeProgress = defineTable({
  roadmapId: v.id("roadmaps"),
  userId: v.string(),
  nodeId: v.string(),
  completedAt: v.number(),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_roadmap_and_node", ["roadmapId", "nodeId"]);
