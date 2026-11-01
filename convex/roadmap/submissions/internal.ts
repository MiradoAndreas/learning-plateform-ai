import { documentValidator } from "../../lib/documents";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";

export const getSubmission = internalQuery({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
  returns: documentValidator("roadmapProjectSubmissions"),
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.db.get(submissionId);
    if (!submission) throw new Error("Soumission introuvable");
    return submission;
  },
});

export const getProject = internalQuery({
  args: { projectId: v.id("roadmapProjects") },
  returns: documentValidator("roadmapProjects"),
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Projet introuvable");
    return project;
  },
});

export const setSubmissionReviewing = internalMutation({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
  returns: v.null(),
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
  returns: v.null(),
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
  returns: v.null(),
  handler: async (ctx, { submissionId, errorMessage }) => {
    await ctx.db.patch(submissionId, { status: "failed", errorMessage });
  },
});

export const setSubmissionStatus = internalMutation({
  args: {
    submissionId: v.id("roadmapProjectSubmissions"),
    status: v.union(v.literal("extracting"), v.literal("reviewing")),
  },
  returns: v.null(),
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
  returns: v.null(),
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
  returns: v.id("roadmapSubmissionFileBatches"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("roadmapSubmissionFileBatches", {
      ...args,
      analyzed: false,
    });
  },
});

export const getFileBatch = internalQuery({
  args: { batchId: v.id("roadmapSubmissionFileBatches") },
  returns: documentValidator("roadmapSubmissionFileBatches"),
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
  returns: v.null(),
  handler: async (ctx, args) => {
    const { batchId, ...result } = args;
    await ctx.db.patch(batchId, { ...result, analyzed: true });
  },
});

export const listFileBatches = internalQuery({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
  returns: v.array(documentValidator("roadmapSubmissionFileBatches")),
  handler: async (ctx, { submissionId }) => {
    return await ctx.db
      .query("roadmapSubmissionFileBatches")
      .withIndex("by_submission", (q) => q.eq("submissionId", submissionId))
      .collect();
  },
});
