import type { QueryCtx } from "../_generated/server";

export async function requireIdentity(ctx: Pick<QueryCtx, "auth">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Non authentifié");
  return identity;
}
