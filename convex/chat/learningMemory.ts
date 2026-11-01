import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireOwnedSession } from "./data";
import { requireOwnedRoadmap } from "../roadmap/access";
import { documentValidator } from "../lib/documents";

export const feedbackValidator = v.union(
  v.literal("understood"),
  v.literal("struggling"),
  v.literal("deeper"),
  v.literal("pace"),
);
export const paceValidator = v.union(
  v.literal("slow"),
  v.literal("normal"),
  v.literal("fast"),
);

export function normalizeTopic(topic: string): string {
  return topic
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

export function nextDepth(
  previous: number,
  feedback: "understood" | "struggling" | "deeper" | "pace",
): number {
  return feedback === "pace"
    ? previous
    : feedback === "struggling"
      ? 0
      : Math.min(3, previous + 1);
}

export const saveFeedback = internalMutation({
  args: {
    userId: v.string(),
    roadmapId: v.id("roadmaps"),
    threadId: v.string(),
    topic: v.string(),
    feedback: feedbackValidator,
    pace: v.union(paceValidator, v.null()),
    evidence: v.string(),
    source: v.string(),
    observedAt: v.number(),
  },
  returns: documentValidator("learningMemories"),
  handler: async (ctx, args) => {
    const session = await requireOwnedSession(ctx, args.threadId, args.userId);
    if (session.roadmapId !== args.roadmapId) throw new Error("Introuvable");
    await requireOwnedRoadmap(ctx, args.roadmapId, args.userId);
    const topic = normalizeTopic(args.topic);
    if (!topic || !args.evidence.trim()) throw new Error("Feedback invalide");
    if (args.feedback === "pace" && args.pace === null)
      throw new Error("Rythme manquant");
    const existing = await ctx.db
      .query("learningMemories")
      .withIndex("by_user_topic", (q) =>
        q.eq("userId", args.userId).eq("topic", topic),
      )
      .unique();
    if (
      existing &&
      (existing.source === args.source || existing.updatedAt > args.observedAt)
    )
      return existing;
    const fields = {
      userId: args.userId,
      topic,
      depth: nextDepth(existing?.depth ?? 1, args.feedback),
      pace:
        args.pace ??
        (args.feedback === "struggling"
          ? ("slow" as const)
          : (existing?.pace ?? ("normal" as const))),
      feedback: args.feedback,
      evidence: args.evidence.slice(0, 500),
      understoodCount:
        (existing?.understoodCount ?? 0) +
        (args.feedback === "understood" ? 1 : 0),
      difficultyCount:
        (existing?.difficultyCount ?? 0) +
        (args.feedback === "struggling" ? 1 : 0),
      source: args.source,
      updatedAt: args.observedAt,
    };
    const id =
      existing?._id ?? (await ctx.db.insert("learningMemories", fields));
    if (existing) await ctx.db.patch(id, fields);
    await ctx.scheduler.runAfter(
      0,
      internal.chat.learningRetrieval.indexMemory,
      { memoryId: id },
    );
    return (await ctx.db.get(id))!;
  },
});

export const getMemory = internalQuery({
  args: { memoryId: v.id("learningMemories") },
  returns: v.union(documentValidator("learningMemories"), v.null()),
  handler: (ctx, { memoryId }) => ctx.db.get(memoryId),
});

export const getOwnedMemories = internalQuery({
  args: { userId: v.string(), memoryIds: v.array(v.id("learningMemories")) },
  returns: v.array(documentValidator("learningMemories")),
  handler: async (ctx, { userId, memoryIds }) => {
    const result = [];
    for (const id of memoryIds.slice(0, 6)) {
      const memory = await ctx.db.get(id);
      if (memory?.userId === userId) result.push(memory);
    }
    return result;
  },
});

export const recentTopics = internalQuery({
  args: { userId: v.string() },
  returns: v.array(v.string()),
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("learningMemories")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
    return rows.map((row) => row.topic);
  },
});

export const getProgressContext = internalQuery({
  args: { roadmapId: v.id("roadmaps"), userId: v.string() },
  returns: v.array(v.string()),
  handler: async (ctx, { roadmapId, userId }) => {
    const roadmap = await requireOwnedRoadmap(ctx, roadmapId, userId);
    const nodes =
      roadmap.roadmapData?.sections.flatMap((section) => [
        ...section.leftNodes,
        ...section.rightNodes,
      ]) ?? [];
    const completed = await ctx.db
      .query("roadmapNodeProgress")
      .withIndex("by_roadmap", (q) => q.eq("roadmapId", roadmapId))
      .order("desc")
      .take(500);
    return completed.flatMap((row) => {
      const node = nodes.find((node) => node.id === row.nodeId);
      return row.userId === userId && node
        ? [
            `Quiz réussi : ${node.label}. Date : ${new Date(row.completedAt).toISOString()}.`,
          ]
        : [];
    });
  },
});
