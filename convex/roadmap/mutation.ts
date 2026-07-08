// convex/roadmaps/mutations.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Création rapide (pas d'IA ici) -> l'UI peut naviguer/afficher un loader
// immédiatement, puis déclencher l'action de génération des questions.
export const createRoadmap = mutation({
  args: { topic: v.string() },
  handler: async (ctx, { topic }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    return await ctx.db.insert("roadmaps", {
      userId: identity.subject,
      topic,
      status: "draft",
    });
  },
});
