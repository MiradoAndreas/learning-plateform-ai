// Compatibility endpoint: durable workflows retain this function path.
import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { analyzeFileBatch as analyzeFileBatchHandler } from "./review";

export const analyzeFileBatch = internalAction({
  args: {
    batchId: v.id("roadmapSubmissionFileBatches"),
    userId: v.string(),
    projectTitle: v.string(),
    projectLevel: v.string(),
  },
  returns: v.null(),
  handler: analyzeFileBatchHandler,
});
