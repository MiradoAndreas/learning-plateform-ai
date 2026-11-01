export const AI_MODELS = {
  generation: "openai/gpt-5-nano",
  learning: "openai/gpt-5-mini",
  review: "openai/gpt-4o-mini",
  embedding: "openai/text-embedding-3-small",
} as const;

export const EMBEDDING_DIMENSION = 1536;
export const RAG_TEST_NAMESPACE = "test";
export const RAG_TEST_RESULT_LIMIT = 3;
