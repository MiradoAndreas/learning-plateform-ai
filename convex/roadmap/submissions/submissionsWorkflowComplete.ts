// convex/roadmap/submissions-workflow-complete.ts
import { vWorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";
import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

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
