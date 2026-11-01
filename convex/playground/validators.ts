import { v } from "convex/values";
import { vEntry, vEntryId, vSearchEntry, vSearchResult } from "@convex-dev/rag";

const embeddingUsage = v.object({ tokens: v.optional(v.number()) });
export const ragAddResultValidator = v.object({
  entryId: vEntryId,
  status: vEntry.fields.status,
  created: v.boolean(),
  replacedEntry: v.union(vEntry, v.null()),
  usage: embeddingUsage,
});
export const ragSearchResultValidator = v.object({
  results: v.array(vSearchResult),
  text: v.string(),
  entries: v.array(vSearchEntry),
  usage: embeddingUsage,
});
