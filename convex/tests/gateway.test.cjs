/* eslint-disable @typescript-eslint/no-require-imports -- Local Node regression tests. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { gateway } = require("ai");
const { createLoader } = require("./test.helpers.cjs");

test("Next.js and Convex share the native Gateway provider", () => {
  const load = createLoader();
  assert.equal(load("ai.ts").gateway, gateway);
  assert.equal(load("convex/ai/provider.ts").gateway, gateway);
});

test("Gateway retains existing language models and embedding compatibility", () => {
  const load = createLoader();
  const { AI_MODELS, EMBEDDING_DIMENSION } = load("convex/ai/constants.ts");
  assert.deepEqual(AI_MODELS, {
    roadmap: "nvidia/nemotron-3-ultra-550b-a55b",
    generation: "openai/gpt-5-nano",
    learning: "openai/gpt-5-mini",
    review: "openai/gpt-4o-mini",
    embedding: "openai/text-embedding-3-small",
  });
  for (const role of ["roadmap", "generation", "learning", "review"]) {
    const model = gateway(AI_MODELS[role]);
    assert.equal(model.modelId, AI_MODELS[role]);
    assert.equal(model.provider, "gateway");
  }
  const embedding = gateway.embeddingModel(AI_MODELS.embedding);
  assert.equal(embedding.modelId, "openai/text-embedding-3-small");
  assert.equal(embedding.provider, "gateway");
  assert.equal(EMBEDDING_DIMENSION, 1536);
});

test("historical roadmap helper shares the single-call Convex pipeline", () => {
  const load = createLoader();
  assert.equal(
    load("src/modules/roadmap/lib/roadmap-generator.ts").generateRoadmap,
    load("convex/roadmap/generation/pipeline.ts").generateRoadmap,
  );
});
