import { documentValidator } from "../../lib/documents";
import { requireOwnedRoadmap } from "../access";
import { requireIdentity } from "../../lib/auth";
import { v } from "convex/values";
import { query } from "../../_generated/server";

export const listProjectSubmissions = query({
  args: { projectId: v.id("roadmapProjects") },
  returns: v.array(documentValidator("roadmapProjectSubmissions")),
  handler: async (ctx, { projectId }) => {
    const identity = await requireIdentity(ctx);

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Introuvable");

    await requireOwnedRoadmap(ctx, project.roadmapId, identity.subject);

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
  returns: v.record(
    v.string(),
    v.object({
      attempts: v.number(),
      bestScore: v.union(v.number(), v.null()),
      passed: v.boolean(),
    }),
  ),
  handler: async (
    ctx,
    { roadmapId },
  ): Promise<Record<string, ProjectSubmissionSummary>> => {
    const identity = await requireIdentity(ctx);

    await requireOwnedRoadmap(ctx, roadmapId, identity.subject);

    const submissions = await ctx.db
      .query("roadmapProjectSubmissions")
      .withIndex("by_roadmap_and_user", (q) =>
        q.eq("roadmapId", roadmapId).eq("userId", identity.subject),
      )
      .collect();

    const summary: Record<string, ProjectSubmissionSummary> = {};

    for (const submission of submissions) {
      const key = submission.projectId;
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
