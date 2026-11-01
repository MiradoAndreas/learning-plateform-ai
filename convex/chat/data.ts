import type { QueryCtx } from "../_generated/server";

export function getSessionByThreadId(
  ctx: Pick<QueryCtx, "db">,
  threadId: string,
) {
  return ctx.db
    .query("roadmapThreads")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .unique();
}

export async function requireOwnedSession(
  ctx: Pick<QueryCtx, "db">,
  threadId: string,
  userId: string,
) {
  const session = await getSessionByThreadId(ctx, threadId);
  if (!session || session.userId !== userId) throw new Error("Introuvable");
  return session;
}
