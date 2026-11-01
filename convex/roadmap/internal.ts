import { documentValidator } from "../lib/documents";
// Compatibility boundary: keep persisted workflow and existing action references stable.
import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { roadmapDataValidator } from "./validators";

export {
  getSubmission,
  getProject as getProjectForSubmission,
  setSubmissionReviewing,
  setSubmissionResult,
  setSubmissionFailed,
  setSubmissionStatus,
  setSubmissionCoverage,
  insertFileBatch,
  getFileBatch,
  setFileBatchResult,
  listFileBatches as listAnalyzedBatches,
} from "./submissions/internal";
export {
  listProjects as getRoadmapProjectsInternal,
  saveProjects as saveRoadmapProjects,
} from "./projects/internal";
export {
  getQuiz as getNodeQuiz,
  saveQuiz as saveNodeQuiz,
} from "./progress/internal";
export {
  getPreferences as getRoadmapPreferences,
  listQuestions as getAnsweredQuestions,
  saveGeneratedQuestions,
  saveAnswers,
} from "./questions/internal";

export const getRoadmap = internalQuery({
  args: { roadmapId: v.id("roadmaps") },
  returns: documentValidator("roadmaps"),
  handler: async (ctx, { roadmapId }) => {
    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap) throw new Error("Roadmap introuvable");
    return roadmap;
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
  returns: v.null(),
  handler: async (ctx, { roadmapId, status }) => {
    await ctx.db.patch(roadmapId, { status, errorMessage: undefined });
  },
});

export const saveRoadmapResult = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    title: v.string(),
    summary: v.string(),
    roadmapData: roadmapDataValidator, // même validator que dans le schéma
  },
  returns: v.null(),
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
  returns: v.null(),
  handler: async (ctx, { roadmapId, errorMessage }) => {
    await ctx.db.patch(roadmapId, { status: "failed", errorMessage });
  },
});
