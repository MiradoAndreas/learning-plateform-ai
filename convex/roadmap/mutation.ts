import { requireOwnedRoadmap } from "./access";
import { requireIdentity } from "../lib/auth";
import { QUIZ_PASS_THRESHOLD } from "./progress/constants";
import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Création rapide (pas d'IA ici) -> l'UI peut naviguer/afficher un loader
// immédiatement, puis déclencher l'action de génération des questions.
export const createRoadmap = mutation({
  args: { topic: v.string() },
  returns: v.id("roadmaps"),
  handler: async (ctx, { topic }) => {
    const identity = await requireIdentity(ctx);

    return await ctx.db.insert("roadmaps", {
      userId: identity.subject,
      topic,
      status: "draft",
    });
  },
});

export const submitNodeQuiz = mutation({
  args: {
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    quizId: v.id("roadmapNodeQuizzes"),
    answers: v.array(v.number()),
  },
  returns: v.object({
    passed: v.boolean(),
    score: v.number(),
    correctCount: v.number(),
    total: v.number(),
  }),
  handler: async (ctx, { roadmapId, nodeId, quizId, answers }) => {
    const identity = await requireIdentity(ctx);

    await requireOwnedRoadmap(ctx, roadmapId, identity.subject);

    const quiz = await ctx.db.get(quizId);
    if (!quiz || quiz.roadmapId !== roadmapId || quiz.nodeId !== nodeId) {
      throw new Error("Quiz introuvable");
    }

    if (answers.length !== quiz.questions.length) {
      throw new Error("Réponses incomplètes");
    }

    const correctCount = quiz.questions.reduce(
      (count, question, index) =>
        answers[index] === question.correctIndex ? count + 1 : count,
      0,
    );

    const score = correctCount / quiz.questions.length;
    const passed = score >= QUIZ_PASS_THRESHOLD;

    if (passed) {
      const alreadyCompleted = await ctx.db
        .query("roadmapNodeProgress")
        .withIndex("by_roadmap_and_node", (q) =>
          q.eq("roadmapId", roadmapId).eq("nodeId", nodeId),
        )
        .unique();

      if (!alreadyCompleted) {
        await ctx.db.insert("roadmapNodeProgress", {
          roadmapId,
          userId: identity.subject,
          nodeId,
          completedAt: Date.now(),
        });
      }
    }

    return { passed, score, correctCount, total: quiz.questions.length };
  },
});
