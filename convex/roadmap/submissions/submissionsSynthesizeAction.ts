// convex/roadmap/submissions-synthesize-action.ts
import { v } from "convex/values";
import z from "zod";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { projectReviewAgent } from "../../agents/projectReviewAgent";
import { SUBMISSION_PASS_THRESHOLD } from "../constants";

const finalReviewSchema = z.object({
  score: z.number().min(0).max(10),
  summary: z.string(),
  strengths: z.array(z.string()).min(1).max(5),
  improvements: z.array(z.string()).min(1).max(5),
  meetsObjectives: z.boolean(),
});

export const synthesizeSubmissionReview = internalAction({
  args: { submissionId: v.id("roadmapProjectSubmissions") },
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.runQuery(
      internal.roadmap.internal.getSubmission,
      { submissionId },
    );
    const project = await ctx.runQuery(
      internal.roadmap.internal.getProjectForSubmission,
      { projectId: submission.projectId },
    );
    const batches = await ctx.runQuery(
      internal.roadmap.internal.listAnalyzedBatches,
      { submissionId },
    );

    const consolidatedFindings = batches
      .map(
        (
          batch,
          i,
        ) => `## Lot ${i + 1} (${batch.filesReviewed?.join(", ") ?? "—"})
Observations :
${(batch.observations ?? []).map((o) => `- ${o}`).join("\n")}
Problèmes notables :
${(batch.notableIssues ?? []).map((n) => `- ${n}`).join("\n") || "- Aucun"}`,
      )
      .join("\n\n");

    const { thread } = await projectReviewAgent.createThread(ctx, {
      userId: submission.userId,
    });

    const { object } = await thread.generateObject(
      {
        prompt: `Voici les observations consolidées de l'analyse complète (par lots) d'un projet pédagogique.

========================
CONSIGNE DU PROJET
========================

Titre : ${project.title}
Niveau : ${project.level}
Description : ${project.description}

Objectifs pédagogiques :
${project.objectives.map((o) => `- ${o}`).join("\n")}

========================
OBSERVATIONS PAR LOT (${batches.length} lot(s), couvrant l'ensemble du projet analysé)
========================

${consolidatedFindings}

========================
INSTRUCTIONS
========================

Synthétise une évaluation globale sur 10, en tenant compte du niveau annoncé (${project.level}).
Base-toi uniquement sur les observations ci-dessus, qui couvrent l'intégralité des fichiers pertinents du projet.`,
        schema: finalReviewSchema,
      },
      { storageOptions: { saveMessages: "none" } },
    );

    await ctx.runMutation(internal.roadmap.internal.setSubmissionResult, {
      submissionId,
      score: object.score,
      passed: object.score >= SUBMISSION_PASS_THRESHOLD,
      summary: object.summary,
      strengths: object.strengths,
      improvements: object.improvements,
      meetsObjectives: object.meetsObjectives,
    });
  },
});
