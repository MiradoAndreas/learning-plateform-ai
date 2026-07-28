// convex/roadmaps/mutations.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Création rapide (pas d'IA ici) -> l'UI peut naviguer/afficher un loader
// immédiatement, puis déclencher l'action de génération des questions.
export const createRoadmap = mutation({
  args: { topic: v.string() },
  handler: async (ctx, { topic }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    return await ctx.db.insert("roadmaps", {
      userId: identity.subject,
      topic,
      status: "draft",
    });
  },
});

const PASS_THRESHOLD = 0.8;

export const submitNodeQuiz = mutation({
  args: {
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    quizId: v.id("roadmapNodeQuizzes"),
    answers: v.array(v.number()),
  },
  handler: async (ctx, { roadmapId, nodeId, quizId, answers }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap || roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

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
    const passed = score >= PASS_THRESHOLD;

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
