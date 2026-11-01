import { v } from "convex/values";
import { vPaginationResult } from "@convex-dev/agent";

// AI SDK parts and metadata are extensible. Validate their container while
// allowing SDK-defined payloads; application-owned fields stay explicit.
const uiMessageValidator = v.object({
  id: v.string(),
  role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
  parts: v.array(v.any()),
  metadata: v.optional(v.any()),
  key: v.string(),
  order: v.number(),
  stepOrder: v.number(),
  status: v.union(
    v.literal("streaming"),
    v.literal("pending"),
    v.literal("success"),
    v.literal("failed"),
  ),
  agentName: v.optional(v.string()),
  userId: v.optional(v.string()),
  text: v.string(),
  _creationTime: v.number(),
});

export const threadMessagesValidator = vPaginationResult(uiMessageValidator);
