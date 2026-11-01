import { documentValidator } from "../../lib/documents";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";
import { quizQuestionValidator } from "./validators";

export const getQuiz = internalQuery({
  args: { roadmapId: v.id("roadmaps"), nodeId: v.string() },
  returns: v.union(documentValidator("roadmapNodeQuizzes"), v.null()),
  handler: async (ctx, { roadmapId, nodeId }) => {
    return await ctx.db
      .query("roadmapNodeQuizzes")
      .withIndex("by_roadmap_and_node", (q) =>
        q.eq("roadmapId", roadmapId).eq("nodeId", nodeId),
      )
      .unique();
  },
});

export const saveQuiz = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    questions: v.array(quizQuestionValidator),
  },
  returns: v.id("roadmapNodeQuizzes"),
  handler: async (ctx, { roadmapId, nodeId, questions }) => {
    return await ctx.db.insert("roadmapNodeQuizzes", {
      roadmapId,
      nodeId,
      questions,
    });
  },
});
