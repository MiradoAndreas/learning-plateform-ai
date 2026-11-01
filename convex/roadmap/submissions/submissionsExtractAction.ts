"use node";

import { v } from "convex/values";
import JSZip from "jszip";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import {
  isRelevantFile,
  chunkSubmissionFiles,
  formatFileBatch,
} from "./archive";

export const extractAndChunkSubmission = internalAction({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
  returns: v.object({
    batchIds: v.array(v.id("roadmapSubmissionFileBatches")),
    truncated: v.boolean(),
  }),
  handler: async (
    ctx,
    { submissionId },
  ): Promise<{
    batchIds: Id<"roadmapSubmissionFileBatches">[];
    truncated: boolean;
  }> => {
    const submission = await ctx.runQuery(
      internal.roadmap.internal.getSubmission,
      { submissionId },
    );

    await ctx.runMutation(internal.roadmap.internal.setSubmissionStatus, {
      submissionId,
      status: "extracting",
    });

    const blob = await ctx.storage.get(submission.storageId);
    if (!blob) throw new Error("Fichier introuvable dans le stockage");

    const arrayBuffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const relevantEntries = Object.values(zip.files).filter(
      (entry) => !entry.dir && isRelevantFile(entry.name),
    );

    if (relevantEntries.length === 0) {
      throw new Error(
        "Aucun fichier de code reconnu n'a été trouvé dans l'archive",
      );
    }

    const { batches, filesIncluded, truncated } =
      await chunkSubmissionFiles(relevantEntries);

    const batchIds: Id<"roadmapSubmissionFileBatches">[] = [];

    for (let i = 0; i < batches.length; i++) {
      const files = batches[i];
      const content = formatFileBatch(files);

      const batchId = await ctx.runMutation(
        internal.roadmap.internal.insertFileBatch,
        {
          submissionId,
          batchIndex: i,
          filePaths: files.map((f) => f.path),
          content,
        },
      );
      batchIds.push(batchId);
    }

    await ctx.runMutation(internal.roadmap.internal.setSubmissionCoverage, {
      submissionId,
      totalFilesInProject: relevantEntries.length,
      totalFilesAnalyzed: filesIncluded,
      totalBatches: batches.length,
      truncated,
    });

    return { batchIds, truncated };
  },
});
