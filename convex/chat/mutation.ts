import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createSession = mutation({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, { roadmapId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap || roadmap.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    return await ctx.db.insert("chat_sessions", {
      roadmapId,
      userId: identity.subject,
      title: "Nouvelle discussion",
    });
  },
});
