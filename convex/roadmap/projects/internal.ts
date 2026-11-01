import { documentValidator } from "../../lib/documents";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";
import { projectFields } from "./validators";
import { listRoadmapProjects } from "./model";

export const listProjects = internalQuery({
  args: { roadmapId: v.id("roadmaps") },
  returns: v.array(documentValidator("roadmapProjects")),
  handler: async (ctx, { roadmapId }) => {
    return await listRoadmapProjects(ctx, roadmapId);
  },
});

export const saveProjects = internalMutation({
  args: {
    roadmapId: v.id("roadmaps"),
    projects: v.array(v.object(projectFields)),
  },
  returns: v.null(),
  handler: async (ctx, { roadmapId, projects }) => {
    await Promise.all(
      projects.map((project) =>
        ctx.db.insert("roadmapProjects", { roadmapId, ...project }),
      ),
    );
  },
});
