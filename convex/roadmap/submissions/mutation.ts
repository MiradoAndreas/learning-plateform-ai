import { requireOwnedRoadmap } from "../access";
import { requireIdentity } from "../../lib/auth";
import { v } from "convex/values";
import { mutation } from "../../_generated/server";

import { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { workflow } from "../../workflows/manager";

export const generateSubmissionUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx): Promise<string> => {
    await requireIdentity(ctx);
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
  returns: v.id("roadmapProjectSubmissions"),
  handler: async (
    ctx,
    { roadmapId, projectId, storageId, fileName },
  ): Promise<Id<"roadmapProjectSubmissions">> => {
    const identity = await requireIdentity(ctx);

    await requireOwnedRoadmap(ctx, roadmapId, identity.subject);

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

    // Démarre le workflow durable au lieu de l'ancienne action directe.
    await workflow.start(
      ctx,
      internal.roadmap.submissions.submissionsWorkflow.reviewSubmissionWorkflow,
      {
        submissionId,
        userId: identity.subject,
        projectTitle: project.title,
        projectLevel: project.level,
      },
      {
        onComplete:
          internal.roadmap.submissions.submissionsWorkflowComplete
            .handleSubmissionReviewComplete,
        context: submissionId,
      },
    );

    return submissionId;
  },
});
