// convex/roadmap/submissions-workflow.ts
import { v } from "convex/values";
import { workflow } from "../../workflows/manager";
import { internal } from "../../_generated/api";
import { internalMutation } from "../../_generated/server";
import { vResultValidator, vWorkflowId } from "@convex-dev/workflow";

export const reviewSubmissionWorkflow = workflow.define({
  args: {
    submissionId: v.id("roadmapProjectSubmissions"),
    userId: v.string(),
    projectTitle: v.string(),
    projectLevel: v.string(),
  },
  handler: async (
    step,
    { submissionId, userId, projectTitle, projectLevel },
  ): Promise<void> => {
    console.log("Review Submission Work flow");
    // Étape 1 : extraction + découpage, avec retry si le stockage est
    // temporairement indisponible.
    const { batchIds } = await step.runAction(
      internal.roadmap.submissions.submissionsExtractAction
        .extractAndChunkSubmission,
      { submissionId },
      { retry: true },
    );

    await step.runMutation(internal.roadmap.internal.setSubmissionStatus, {
      submissionId,
      status: "reviewing",
    });

    // Étape 2 : chaque lot est analysé indépendamment, en parallèle
    // (limité par maxParallelism côté WorkflowManager). C'est ici que
    // réside la vraie "analyse complète" : tous les lots sont couverts,
    // pas seulement un sous-ensemble arbitraire.
    await Promise.all(
      batchIds.map((batchId) =>
        step.runAction(
          internal.roadmap.submissions.submissionsAnalyseBatchAction
            .analyzeFileBatch,
          { batchId, userId, projectTitle, projectLevel },
          { retry: true },
        ),
      ),
    );

    // Étape 3 : synthèse finale à partir de tous les lots analysés.
    await step.runAction(
      internal.roadmap.submissions.submissionsSynthesizeAction
        .synthesizeSubmissionReview,
      { submissionId },
      { retry: true },
    );
  },
});

export const handleSubmissionReviewComplete = internalMutation({
  args: {
    workflowId: vWorkflowId,
    result: vResultValidator,
    context: v.id("roadmapProjectSubmissions"),
  },
  handler: async (ctx, { result, context: submissionId }) => {
    console.log("Handle Submission Review Complete");
    if (result.kind === "success") return; // déjà marqué "completed" par synthesizeSubmissionReview

    const errorMessage =
      result.kind === "failed"
        ? result.error
        : "L'analyse a été annulée avant sa fin";

    await ctx.db.patch(submissionId, { status: "failed", errorMessage });
  },
});
