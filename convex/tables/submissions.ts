import { defineTable } from "convex/server";
import { v } from "convex/values";
import { submissionStatusValidator } from "../roadmap/submissions/validators";

export const roadmapProjectSubmissions = defineTable({
  roadmapId: v.id("roadmaps"),
  projectId: v.id("roadmapProjects"),
  userId: v.string(),
  storageId: v.id("_storage"),
  fileName: v.string(),
  status: submissionStatusValidator,
  score: v.optional(v.number()),
  passed: v.optional(v.boolean()),
  summary: v.optional(v.string()),
  strengths: v.optional(v.array(v.string())),
  improvements: v.optional(v.array(v.string())),
  meetsObjectives: v.optional(v.boolean()),
  errorMessage: v.optional(v.string()),
  // Transparence sur la couverture réelle de l'analyse.
  totalFilesInProject: v.optional(v.number()),
  totalFilesAnalyzed: v.optional(v.number()),
  totalBatches: v.optional(v.number()),
  truncated: v.optional(v.boolean()), // true si le plafond de sécurité a été atteint
  submittedAt: v.number(),
  reviewedAt: v.optional(v.number()),
})
  .index("by_project", ["projectId"])
  .index("by_project_and_user", ["projectId", "userId"])
  .index("by_roadmap_and_user", ["roadmapId", "userId"]);

export const roadmapSubmissionFileBatches = defineTable({
  submissionId: v.id("roadmapProjectSubmissions"),
  batchIndex: v.number(),
  filePaths: v.array(v.string()),
  content: v.string(), // contenu brut concaténé du lot, servi à l'analyse
  filesReviewed: v.optional(v.array(v.string())),
  observations: v.optional(v.array(v.string())),
  notableIssues: v.optional(v.array(v.string())),
  analyzed: v.boolean(),
}).index("by_submission", ["submissionId"]);
