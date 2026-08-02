import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { roadmapDataValidator } from "./roadmap";
import {
  LEARNING_RESOURCE_QUESTION,
  LEARNING_RESOURCE_QUESTION_KEY,
} from "./constants";
import { quizQuestionValidator } from "./progress";
import { skillLevelValidator } from "./projects";

export const getSubmission = internalQuery({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.db.get(submissionId);
    if (!submission) throw new Error("Soumission introuvable");
    return submission;
  },
});

export const getProjectForSubmission = internalQuery({
  args: { projectId: v.id("roadmapProjects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Projet introuvable");
    return project;
  },
});

export const setSubmissionReviewing = internalMutation({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
  handler: async (ctx, { submissionId }) => {
    await ctx.db.patch(submissionId, { status: "reviewing" });
  },
});

export const setSubmissionResult = internalMutation({
  args: {
    submissionId: v.id("roadmapProjectSubmissions"),
    score: v.number(),
    passed: v.boolean(),
    summary: v.string(),
    strengths: v.array(v.string()),
    improvements: v.array(v.string()),
    meetsObjectives: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { submissionId, ...result } = args;
    await ctx.db.patch(submissionId, {
      ...result,
      status: "completed",
      reviewedAt: Date.now(),
    });
  },
});

export const setSubmissionFailed = internalMutation({
  args: {
    submissionId: v.id("roadmapProjectSubmissions"),
    errorMessage: v.string(),
  },
  handler: async (ctx, { submissionId, errorMessage }) => {
    await ctx.db.patch(submissionId, { status: "failed", errorMessage });
  },
});

export const getRoadmapProjectsInternal = internalQuery({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => {
    return await ctx.db
      .query("roadmapProjects")
      .withIndex("by_roadmap_and_order", (q) => q.eq("roadmapId", roadmapId))
      .collect();
  },
});

export const setSubmissionStatus = internalMutation({
  args: {
    submissionId: v.id("roadmapProjectSubmissions"),
    status: v.union(v.literal("extracting"), v.literal("reviewing")),
  },
  handler: async (ctx, { submissionId, status }) => {
    await ctx.db.patch(submissionId, { status });
  },
});

export const setSubmissionCoverage = internalMutation({
  args: {
    submissionId: v.id("roadmapProjectSubmissions"),
    totalFilesInProject: v.number(),
    totalFilesAnalyzed: v.number(),
    totalBatches: v.number(),
    truncated: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { submissionId, ...coverage } = args;
    await ctx.db.patch(submissionId, coverage);
  },
});

export const insertFileBatch = internalMutation({
  args: {
    submissionId: v.id("roadmapProjectSubmissions"),
    batchIndex: v.number(),
    filePaths: v.array(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("roadmapSubmissionFileBatches", {
      ...args,
      analyzed: false,
    });
  },
});

export const getFileBatch = internalQuery({
  args: { batchId: v.id("roadmapSubmissionFileBatches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Lot introuvable");
    return batch;
  },
});

export const setFileBatchResult = internalMutation({
  args: {
    batchId: v.id("roadmapSubmissionFileBatches"),
    filesReviewed: v.array(v.string()),
    observations: v.array(v.string()),
    notableIssues: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { batchId, ...result } = args;
    await ctx.db.patch(batchId, { ...result, analyzed: true });
  },
});

export const listAnalyzedBatches = internalQuery({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
  handler: async (ctx, { submissionId }) => {
    return await ctx.db
      .query("roadmapSubmissionFileBatches")
      .withIndex("by_submission", (q) => q.eq("submissionId", submissionId))
      .collect();
  },
});

export const saveRoadmapProjects = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    projects: v.array(
      v.object({
        level: skillLevelValidator,
        order: v.number(),
        title: v.string(),
        description: v.string(),
        objectives: v.array(v.string()),
        skillsPracticed: v.array(v.string()),
        estimatedDuration: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { roadmapId, projects }) => {
    await Promise.all(
      projects.map((project) =>
        ctx.db.insert("roadmapProjects", { roadmapId, ...project }),
      ),
    );
  },
});

export const getNodeQuiz = internalQuery({
  args: { roadmapId: v.id("roadmaps"), nodeId: v.string() },
  handler: async (ctx, { roadmapId, nodeId }) => {
    return await ctx.db
      .query("roadmapNodeQuizzes")
      .withIndex("by_roadmap_and_node", (q) =>
        q.eq("roadmapId", roadmapId).eq("nodeId", nodeId),
      )
      .unique();
  },
});

export const saveNodeQuiz = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    questions: v.array(quizQuestionValidator),
  },
  handler: async (ctx, { roadmapId, nodeId, questions }) => {
    return await ctx.db.insert("roadmapNodeQuizzes", {
      roadmapId,
      nodeId,
      questions,
    });
  },
});

export const getRoadmapPreferences = internalQuery({
  args: {
    roadmapId: v.id("roadmaps"),
  },
  handler: async (ctx, { roadmapId }) => {
    const questions = await ctx.db
      .query("roadmap_questions")
      .withIndex("by_roadmap_and_order", (q) => q.eq("roadmapId", roadmapId))
      .collect();

    const preferences: Record<string, string> = {};

    for (const question of questions) {
      if (!question.answer) continue;

      preferences[question.key] = question.answer;
    }

    return preferences;
  },
});

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
        description: v.optional(v.string()),
        required: v.boolean(),
        options: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, { roadmapId, questions }) => {
    // 1. Le LLM ne doit jamais être la source de vérité pour cette question :
    //    on retire toute tentative de sa part, quelle que soit sa formulation.
    const llmQuestions = questions.filter(
      (q) => q.key !== LEARNING_RESOURCE_QUESTION_KEY,
    );

    // 2. Dédoublonnage par clé, au cas où le LLM générerait deux fois la
    //    même clé sous des libellés différents (garde la première occurrence).
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
    roadmapData: roadmapDataValidator, // même validator que dans le schéma
  },
  handler: async (ctx, { roadmapId, title, summary, roadmapData }) => {
    await ctx.db.patch(roadmapId, {
      title,
      summary,
      roadmapData,
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
