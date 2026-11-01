import { documentValidator } from "../../lib/documents";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";
import {
  LEARNING_RESOURCE_QUESTION,
  LEARNING_RESOURCE_QUESTION_KEY,
} from "./constants";
import { toFieldKey, listRoadmapQuestions } from "./model";

export const getPreferences = internalQuery({
  args: {
    roadmapId: v.id("roadmaps"),
  },
  returns: v.record(v.string(), v.string()),
  handler: async (ctx, { roadmapId }) => {
    const questions = await listRoadmapQuestions(ctx, roadmapId);

    const preferences: Record<string, string> = {};

    for (const question of questions) {
      if (!question.answer) continue;

      preferences[toFieldKey(question.key)] = question.answer;
    }

    return preferences;
  },
});

export const listQuestions = internalQuery({
  args: { roadmapId: v.id("roadmaps") },
  returns: v.array(documentValidator("roadmap_questions")),
  handler: async (ctx, { roadmapId }) => {
    return await listRoadmapQuestions(ctx, roadmapId);
  },
});

export const saveGeneratedQuestions = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    questions: v.array(
      v.object({
        key: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        required: v.boolean(),
        options: v.array(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { roadmapId, questions }) => {
    const llmQuestions = questions
      .filter((q) => q.key !== LEARNING_RESOURCE_QUESTION_KEY)
      .map((q) => ({ ...q, key: toFieldKey(q.key) })); // ← sanitize ici

    const seenKeys = new Set<string>();
    const dedupedQuestions = llmQuestions.filter((q) => {
      if (seenKeys.has(q.key)) return false;
      seenKeys.add(q.key);
      return true;
    });

    // 3. On ajoute la question canonique, fixe et contrôlée par le code.
    const finalQuestions = [...dedupedQuestions, LEARNING_RESOURCE_QUESTION];

    await Promise.all(
      finalQuestions.map((q, index) =>
        ctx.db.insert("roadmap_questions", {
          roadmapId,
          order: index,
          key: q.key,
          title: q.title,
          description: q.description ?? null,
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
  returns: v.null(),
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
