// convex/roadmap/submissions-analyze-batch-action.ts
import { v } from "convex/values";
import z from "zod";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { projectReviewAgent } from "../../agents/projectReviewAgent";

const batchAnalysisSchema = z.object({
  filesReviewed: z.array(z.string()),
  observations: z
    .array(z.string())
    .describe("Constats factuels sur la qualité du code de ce lot"),
  notableIssues: z
    .array(z.string())
    .describe("Problèmes ou manques notables identifiés dans ce lot"),
});

export const analyzeFileBatch = internalAction({
  args: {
    batchId: v.id("roadmapSubmissionFileBatches"),
    userId: v.string(),
    projectTitle: v.string(),
    projectLevel: v.string(),
  },
  handler: async (ctx, { batchId, userId, projectTitle, projectLevel }) => {
    const batch = await ctx.runQuery(internal.roadmap.internal.getFileBatch, {
      batchId,
    });

    const { thread } = await projectReviewAgent.createThread(ctx, { userId });

    const { object } = await thread.generateObject(
      {
        prompt: `Voici un lot de fichiers extraits d'un projet pédagogique "${projectTitle}" (niveau ${projectLevel}).

Analyse UNIQUEMENT les fichiers de ce lot. Ne fais aucune supposition sur le reste du projet, que tu ne vois pas ici — une synthèse globale sera faite séparément à partir de tous les lots.

${batch.content}

Pour chaque fichier pertinent, note des observations factuelles sur la qualité, la structure, les bonnes pratiques suivies ou non. Signale les problèmes notables (bugs potentiels, mauvaises pratiques, sécurité, etc.) s'il y en a.`,
        schema: batchAnalysisSchema,
      },
      { storageOptions: { saveMessages: "none" } },
    );

    await ctx.runMutation(internal.roadmap.internal.setFileBatchResult, {
      batchId,
      filesReviewed: object.filesReviewed,
      observations: object.observations,
      notableIssues: object.notableIssues,
    });
  },
});
