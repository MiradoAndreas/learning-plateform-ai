import { requireOwnedSession } from "./data";
import { requireOwnedRoadmap } from "../roadmap/access";
import { requireIdentity } from "../lib/auth";
import { DEFAULT_SESSION_TITLE, MAX_SESSION_TITLE_LENGTH } from "./constants";
import { v } from "convex/values";
import { createThread } from "@convex-dev/agent";
import { mutation } from "../_generated/server";
import { components } from "../_generated/api";

export const createSession = mutation({
  args: { roadmapId: v.id("roadmaps") },
  returns: v.string(),
  handler: async (ctx, { roadmapId }): Promise<string> => {
    const identity = await requireIdentity(ctx);

    await requireOwnedRoadmap(ctx, roadmapId, identity.subject);

    const threadId = await createThread(ctx, components.agent, {
      userId: identity.subject,
      title: DEFAULT_SESSION_TITLE,
    });

    await ctx.db.insert("roadmapThreads", {
      roadmapId,
      userId: identity.subject,
      threadId,
      title: DEFAULT_SESSION_TITLE,
    });

    return threadId;
  },
});

export const renameSession = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { threadId, title }) => {
    const identity = await requireIdentity(ctx);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new Error("Le titre ne peut pas être vide");
    if (trimmedTitle.length > MAX_SESSION_TITLE_LENGTH) {
      throw new Error("Le titre est trop long");
    }

    const session = await requireOwnedSession(ctx, threadId, identity.subject);

    await ctx.db.patch(session._id, { title: trimmedTitle });

    // Garde les métadonnées de l'agent synchronisées
    await ctx.runMutation(components.agent.threads.updateThread, {
      threadId,
      patch: { title: trimmedTitle },
    });
  },
});
