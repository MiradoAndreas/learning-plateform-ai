// convex/playground/rag-test.ts
"use node";

import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { action } from "../_generated/server";
import { components } from "../_generated/api";
import { v } from "convex/values";

const rag = new RAG(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
});

export const addTestDoc = action({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    return await rag.add(ctx, {
      namespace: "test",
      text,
    });
  },
});

export const searchTestDoc = action({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const results = await rag.search(ctx, {
      namespace: "test",
      query,
      limit: 3,
    });
    return results;
  },
});
