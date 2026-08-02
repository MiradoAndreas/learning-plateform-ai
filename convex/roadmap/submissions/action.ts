// convex/roadmap/submissions-action.ts
"use node";

import { v } from "convex/values";
import z from "zod";
import JSZip from "jszip";
import { internalAction } from "../../_generated/server";
import { projectReviewAgent } from "../../agents/projectReviewAgent";
import { internal } from "../../_generated/api";
import { SUBMISSION_PASS_THRESHOLD } from "../constants";

const MAX_FILES_ANALYZED = 40;
const MAX_CHARS_PER_FILE = 4000;
const MAX_TOTAL_CHARS = 60000;

const IGNORED_SEGMENTS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  "__pycache__/",
  ".venv/",
];

const TEXT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".java",
  ".go",
  ".rb",
  ".php",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".rs",
  ".swift",
  ".kt",
  ".html",
  ".css",
  ".scss",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".toml",
  ".sql",
  ".sh",
];

function isRelevantFile(path: string): boolean {
  const lower = path.toLowerCase();
  if (IGNORED_SEGMENTS.some((segment) => lower.includes(segment))) return false;
  return TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

const reviewSchema = z.object({
  score: z.number().min(0).max(10).describe("Note globale sur 10"),
  summary: z.string().describe("Résumé de l'évaluation en 2 à 4 phrases"),
  strengths: z.array(z.string()).min(1).max(5),
  improvements: z.array(z.string()).min(1).max(5),
  meetsObjectives: z
    .boolean()
    .describe("Le projet remplit-il les objectifs pédagogiques demandés ?"),
});

export const reviewProjectSubmission = internalAction({
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

    await ctx.runMutation(internal.roadmap.internal.setSubmissionReviewing, {
      submissionId,
    });

    try {
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

      let totalChars = 0;
      const fileSections: string[] = [];

      for (const entry of relevantEntries.slice(0, MAX_FILES_ANALYZED)) {
        if (totalChars >= MAX_TOTAL_CHARS) break;

        const content = await entry.async("string");
        const remainingBudget = MAX_TOTAL_CHARS - totalChars;
        const finalContent = content
          .slice(0, MAX_CHARS_PER_FILE)
          .slice(0, remainingBudget);

        fileSections.push(`### ${entry.name}\n\`\`\`\n${finalContent}\n\`\`\``);
        totalChars += finalContent.length;
      }

      const analyzedCount = Math.min(
        relevantEntries.length,
        MAX_FILES_ANALYZED,
      );

      const { thread } = await projectReviewAgent.createThread(ctx, {
        userId: submission.userId,
      });

      const { object } = await thread.generateObject(
        {
          prompt: `Voici un projet pédagogique soumis par un apprenant, à évaluer.

========================
CONSIGNE DU PROJET
========================

Titre : ${project.title}
Niveau : ${project.level}
Description : ${project.description}

Objectifs pédagogiques :
${project.objectives.map((o) => `- ${o}`).join("\n")}

========================
CONTENU DU PROJET SOUMIS
========================

${analyzedCount} fichier(s) analysé(s) sur ${relevantEntries.length} au total dans l'archive.

${fileSections.join("\n\n")}

========================
INSTRUCTIONS
========================

Évalue ce projet sur 10 en tenant compte du niveau annoncé (${project.level}) : n'attends pas la même rigueur d'un "Novice" que d'un "Expert".
Base-toi uniquement sur le code fourni ci-dessus.
Si le contenu semble incomplet ou tronqué, mentionne-le dans le résumé sans pénaliser injustement.`,
          schema: reviewSchema,
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
    } catch (error) {
      await ctx.runMutation(internal.roadmap.internal.setSubmissionFailed, {
        submissionId,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'analyse",
      });
    }
  },
});
