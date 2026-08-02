// convex/roadmap/submissions-mutation.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";

import { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";

export const generateSubmissionUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");
    return await ctx.storage.generateUploadUrl();
  },
});

export const submitProject = mutation({
  args: {
    roadmapId: v.id("roadmaps"),
    projectId: v.id("roadmapProjects"),
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (
    ctx,
    { roadmapId, projectId, storageId, fileName },
  ): Promise<Id<"roadmapProjectSubmissions">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap || roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    const project = await ctx.db.get(projectId);
    if (!project || project.roadmapId !== roadmapId) {
      throw new Error("Projet introuvable");
    }

    if (!fileName.toLowerCase().endsWith(".zip")) {
      throw new Error("Le fichier doit être une archive .zip");
    }

    const submissionId = await ctx.db.insert("roadmapProjectSubmissions", {
      roadmapId,
      projectId,
      userId: identity.subject,
      storageId,
      fileName,
      status: "uploaded",
      submittedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(
      0,
      internal.roadmap.submissions.action.reviewProjectSubmission,
      { submissionId },
    );

    return submissionId;
  },
});
