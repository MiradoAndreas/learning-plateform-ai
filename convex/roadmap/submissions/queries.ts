// convex/roadmap/submissions-queries.ts
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

export const listProjectSubmissions = query({
  args: { projectId: v.id("roadmapProjects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Introuvable");

    const roadmap = await ctx.db.get(project.roadmapId);
    if (!roadmap || roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    return await ctx.db
      .query("roadmapProjectSubmissions")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", projectId).eq("userId", identity.subject),
      )
      .order("desc")
      .collect();
  },
});

type ProjectSubmissionSummary = {
  attempts: number;
  bestScore: number | null;
  passed: boolean;
};

export const getSubmissionsSummaryByRoadmap = query({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (
    ctx,
    { roadmapId },
  ): Promise<Record<string, ProjectSubmissionSummary>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap || roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    const submissions = await ctx.db
      .query("roadmapProjectSubmissions")
      .withIndex("by_roadmap_and_user", (q) =>
        q.eq("roadmapId", roadmapId).eq("userId", identity.subject),
      )
      .collect();

    const summary: Record<string, ProjectSubmissionSummary> = {};

    for (const submission of submissions) {
      const key = submission.projectId as Id<"roadmapProjects">;
      const current = summary[key] ?? {
        attempts: 0,
        bestScore: null,
        passed: false,
      };

      current.attempts += 1;

      if (
        submission.status === "completed" &&
        typeof submission.score === "number"
      ) {
        if (
          current.bestScore === null ||
          submission.score > current.bestScore
        ) {
          current.bestScore = submission.score;
        }
        if (submission.passed) {
          current.passed = true;
        }
      }

      summary[key] = current;
    }

    return summary;
  },
});
