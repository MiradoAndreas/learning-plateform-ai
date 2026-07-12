import { v } from "convex/values";
import { createThread } from "@convex-dev/agent";
import { mutation } from "../_generated/server";
import { components } from "../_generated/api";

export const createSession = mutation({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap || roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    const threadId = await createThread(ctx, components.agent, {
      userId: identity.subject,
      title: "Nouvelle discussion",
    });

    await ctx.db.insert("roadmapThreads", {
      roadmapId,
      userId: identity.subject,
      threadId,
      title: "Nouvelle discussion",
    });

    return threadId;
  },
});
