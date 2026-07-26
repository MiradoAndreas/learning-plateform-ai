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

export const renameSession = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, { threadId, title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new Error("Le titre ne peut pas être vide");
    if (trimmedTitle.length > 80) {
      throw new Error("Le titre est trop long");
    }

    const session = await ctx.db
      .query("roadmapThreads")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .unique();

    if (!session || session.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    await ctx.db.patch(session._id, { title: trimmedTitle });

    // Garde les métadonnées de l'agent synchronisées
    await ctx.runMutation(components.agent.threads.updateThread, {
      threadId,
      patch: { title: trimmedTitle },
    });
  },
});
