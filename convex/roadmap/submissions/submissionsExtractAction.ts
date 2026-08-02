// convex/roadmap/submissions-extract-action.ts
"use node";

import { v } from "convex/values";
import JSZip from "jszip";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import {
  BATCH_CHAR_BUDGET,
  isRelevantFile,
  MAX_BATCHES,
  MAX_SINGLE_FILE_CHARS,
} from "../constants";

export const extractAndChunkSubmission = internalAction({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
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

    // Découpage en lots : chaque fichier apparaît une seule fois, dans un
    // seul lot, sans plafond artificiel sur le nombre de fichiers total —
    // seul un fichier individuellement énorme est tronqué (avec mention).
    type PendingFile = { path: string; content: string };
    const batches: PendingFile[][] = [];
    let currentBatch: PendingFile[] = [];
    let currentBatchChars = 0;
    let filesIncluded = 0;
    let truncated = false;

    for (const entry of relevantEntries) {
      if (batches.length >= MAX_BATCHES && currentBatch.length === 0) {
        truncated = true;
        break;
      }

      let content = await entry.async("string");
      if (content.length > MAX_SINGLE_FILE_CHARS) {
        content =
          content.slice(0, MAX_SINGLE_FILE_CHARS) +
          `\n\n[... fichier tronqué, ${content.length} caractères au total ...]`;
      }

      if (
        currentBatchChars + content.length > BATCH_CHAR_BUDGET &&
        currentBatch.length > 0
      ) {
        batches.push(currentBatch);
        currentBatch = [];
        currentBatchChars = 0;

        if (batches.length >= MAX_BATCHES) {
          truncated = true;
          break;
        }
      }

      currentBatch.push({ path: entry.name, content });
      currentBatchChars += content.length;
      filesIncluded += 1;
    }

    if (currentBatch.length > 0 && batches.length < MAX_BATCHES) {
      batches.push(currentBatch);
    }

    const batchIds: Id<"roadmapSubmissionFileBatches">[] = [];

    for (let i = 0; i < batches.length; i++) {
      const files = batches[i];
      const content = files
        .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
        .join("\n\n");

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
