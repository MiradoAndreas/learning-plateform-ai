import type { ActionCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { projectReviewAgent } from "../../agents/projectReview";
import { SUBMISSION_PASS_THRESHOLD } from "./constants";
import { z } from "zod";

const batchAnalysisSchema = z.object({
  filesReviewed: z.array(z.string()),
  observations: z
    .array(z.string())
    .describe("Constats factuels sur la qualité du code de ce lot"),
  notableIssues: z
    .array(z.string())
    .describe("Problèmes ou manques notables identifiés dans ce lot"),
});

const finalReviewSchema = z.object({
  score: z.number().min(0).max(10),
  summary: z.string(),
  strengths: z.array(z.string()).min(1).max(5),
  improvements: z.array(z.string()).min(1).max(5),
  meetsObjectives: z.boolean(),
});

export async function analyzeFileBatch(
  ctx: ActionCtx,
  {
    batchId,
    userId,
    projectTitle,
    projectLevel,
  }: {
    batchId: Id<"roadmapSubmissionFileBatches">;
    userId: string;
    projectTitle: string;
    projectLevel: string;
  },
): Promise<void> {
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
}

export async function synthesizeSubmissionReview(
  ctx: ActionCtx,
  { submissionId }: { submissionId: Id<"roadmapProjectSubmissions"> },
): Promise<void> {
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
      (batch, i) => `## Lot ${i + 1} (${batch.filesReviewed?.join(", ") ?? "—"})
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
}
