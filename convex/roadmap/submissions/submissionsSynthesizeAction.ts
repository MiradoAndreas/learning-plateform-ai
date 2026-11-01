// Compatibility endpoint: durable workflows retain this function path.
import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { synthesizeSubmissionReview as synthesizeSubmissionReviewHandler } from "./review";

export const synthesizeSubmissionReview = internalAction({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
  returns: v.null(),
  handler: synthesizeSubmissionReviewHandler,
});
