export const AI_MODELS = {
  roadmap: "nvidia/nemotron-3-ultra-550b-a55b",
  generation: "openai/gpt-5-nano",
  learning: "openai/gpt-5-mini",
  review: "openai/gpt-4o-mini",
  embedding: "alibaba/qwen3-embedding-0.6b",
} as const;

export const EMBEDDING_DIMENSION = 1024;
export const RAG_TEST_NAMESPACE = "test";
export const RAG_TEST_RESULT_LIMIT = 3;
