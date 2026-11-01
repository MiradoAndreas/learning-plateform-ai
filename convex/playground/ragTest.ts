"use node";

import { ragAddResultValidator, ragSearchResultValidator } from "./validators";

import {
  AI_MODELS,
  EMBEDDING_DIMENSION,
  RAG_TEST_NAMESPACE,
  RAG_TEST_RESULT_LIMIT,
} from "../ai/constants";
// convex/playground/rag-test.ts

import { RAG } from "@convex-dev/rag";
import { gateway } from "../ai/provider";
import { action } from "../_generated/server";
import { components } from "../_generated/api";
import { v } from "convex/values";

const rag = new RAG(components.rag, {
  textEmbeddingModel: gateway.embeddingModel(AI_MODELS.embedding),
  embeddingDimension: EMBEDDING_DIMENSION,
});

export const addTestDoc = action({
  args: { text: v.string() },
  returns: ragAddResultValidator,
  handler: async (ctx, { text }) => {
    return await rag.add(ctx, {
      namespace: RAG_TEST_NAMESPACE,
      text,
    });
  },
});

export const searchTestDoc = action({
  args: { query: v.string() },
  returns: ragSearchResultValidator,
  handler: async (ctx, { query }) => {
    const results = await rag.search(ctx, {
      namespace: RAG_TEST_NAMESPACE,
      query,
      limit: RAG_TEST_RESULT_LIMIT,
    });
    return results;
  },
});
