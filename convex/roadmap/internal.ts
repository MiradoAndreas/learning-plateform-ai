// convex/roadmaps/internal.ts
import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const getRoadmap = internalQuery({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => {
    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap) throw new Error("Roadmap introuvable");
    return roadmap;
  },
});

export const getAnsweredQuestions = internalQuery({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => {
    return await ctx.db
      .query("roadmap_questions")
      .withIndex("by_roadmap_and_order", (q) => q.eq("roadmapId", roadmapId))
      .collect();
  },
});

export const setStatus = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    status: v.union(
      v.literal("generating_questions"),
      v.literal("generating_roadmap"),
    ),
  },
  handler: async (ctx, { roadmapId, status }) => {
    await ctx.db.patch(roadmapId, { status, errorMessage: undefined });
  },
});

export const saveGeneratedQuestions = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    questions: v.array(
      v.object({
        key: v.string(),
        title: v.string(),
        description: v.string(),
        required: v.boolean(),
        options: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, { roadmapId, questions }) => {
    await Promise.all(
      questions.map((q, index) =>
        ctx.db.insert("roadmap_questions", {
          roadmapId,
          order: index,
          key: q.key,
          title: q.title,
          description: q.description || null,
          required: q.required,
          options: q.options,
        }),
      ),
    );
    await ctx.db.patch(roadmapId, { status: "awaiting_answers" });
  },
});

export const saveAnswers = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    answers: v.array(v.object({ key: v.string(), value: v.string() })),
  },
  handler: async (ctx, { roadmapId, answers }) => {
    for (const { key, value } of answers) {
      const question = await ctx.db
        .query("roadmap_questions")
        .withIndex("by_roadmap_and_key", (q) =>
          q.eq("roadmapId", roadmapId).eq("key", key),
        )
        .unique();

      if (question) {
        await ctx.db.patch(question._id, { answer: value });
      }
    }
    await ctx.db.patch(roadmapId, { status: "generating_roadmap" });
  },
});

export const saveRoadmapResult = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    title: v.string(),
    summary: v.string(),
    mermaid: v.string(),
  },
  handler: async (ctx, { roadmapId, title, summary, mermaid }) => {
    await ctx.db.patch(roadmapId, {
      title,
      summary,
      mermaid,
      status: "completed",
    });
  },
});

export const setFailed = internalMutation({
  args: { roadmapId: v.id("roadmaps"), errorMessage: v.string() },
  handler: async (ctx, { roadmapId, errorMessage }) => {
    await ctx.db.patch(roadmapId, { status: "failed", errorMessage });
  },
});
