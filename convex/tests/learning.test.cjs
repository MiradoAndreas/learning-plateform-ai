/* eslint-disable @typescript-eslint/no-require-imports -- Local Node regression tests. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { getFunctionName } = require("convex/server");
const { createLoader, createContext } = require("./test.helpers.cjs");
const { createHash } = require("node:crypto");

function seededContext() {
  const ctx = createContext({
    roadmaps: [{ _id: "r1", userId: "owner", topic: "JavaScript" }],
    roadmapThreads: [
      { _id: "s1", threadId: "t1", userId: "owner", roadmapId: "r1" },
      { _id: "s2", threadId: "t2", userId: "owner", roadmapId: "r1" },
    ],
  });
  ctx.jobs = [];
  ctx.scheduler = { runAfter: async (...args) => ctx.jobs.push(args) };
  return ctx;
}
const feedbackArgs = {
  userId: "owner",
  roadmapId: "r1",
  threadId: "t1",
  topic: "JavaScript",
  feedback: "understood",
  pace: null,
  evidence: "I understood JavaScript",
  source: "turn1",
  observedAt: 100,
};

test("understanding advances a topic, difficulty resets it and newer feedback wins", async () => {
  const load = createLoader();
  const save = load("convex/chat/learningMemory.ts").saveFeedback._handler;
  const ctx = seededContext();
  const understood = await save(ctx, feedbackArgs);
  assert.equal(understood.depth, 2);
  assert.equal(understood.understoodCount, 1);
  await save(ctx, feedbackArgs);
  assert.equal(ctx.jobs.length, 1, "retry does not advance the topic twice");
  const difficult = await save(ctx, {
    ...feedbackArgs,
    threadId: "t2",
    source: "turn2",
    observedAt: 200,
    feedback: "struggling",
    evidence: "Too difficult",
  });
  assert.equal(difficult._id, understood._id, "memory survives a new chat");
  assert.equal(difficult.depth, 0);
  assert.equal(difficult.pace, "slow");
  assert.equal(difficult.difficultyCount, 1);
  const stale = await save(ctx, {
    ...feedbackArgs,
    source: "older",
    observedAt: 150,
  });
  assert.equal(stale.depth, 0);
  const other = await save(ctx, {
    ...feedbackArgs,
    topic: "React",
    source: "turn3",
    observedAt: 300,
  });
  assert.equal(other.depth, 2);
  assert.notEqual(other._id, difficult._id);
});

test("feedback writes and memory reads enforce user isolation", async () => {
  const load = createLoader();
  const functions = load("convex/chat/learningMemory.ts");
  const ctx = seededContext();
  await assert.rejects(
    functions.saveFeedback._handler(ctx, {
      ...feedbackArgs,
      userId: "intruder",
    }),
    /Introuvable/,
  );
  const saved = await functions.saveFeedback._handler(ctx, feedbackArgs);
  assert.deepEqual(
    await functions.getOwnedMemories._handler(ctx, {
      userId: "intruder",
      memoryIds: [saved._id],
    }),
    [],
  );
  await assert.rejects(
    functions.getProgressContext._handler(ctx, {
      roadmapId: "r1",
      userId: "intruder",
    }),
    /Introuvable/,
  );
});

test("explicit pace changes persist without increasing explanation depth", async () => {
  const load = createLoader();
  const functions = load("convex/chat/learningMemory.ts");
  const ctx = seededContext();
  const memory = await functions.saveFeedback._handler(ctx, {
    ...feedbackArgs,
    feedback: "pace",
    pace: "fast",
  });
  assert.equal(memory.depth, 1);
  assert.equal(memory.pace, "fast");
  assert.equal(memory.understoodCount, 0);
  assert.equal(functions.nextDepth(3, "understood"), 3);
});

test("progress context includes only completed nodes belonging to the learner", async () => {
  const load = createLoader();
  const ctx = seededContext();
  ctx.tables.roadmaps[0].roadmapData = {
    sections: [
      {
        leftNodes: [
          { id: "n1", label: "Closures" },
          { id: "n2", label: "Promises" },
        ],
        rightNodes: [],
      },
    ],
  };
  ctx.tables.roadmapNodeProgress = [
    {
      _id: "p1",
      roadmapId: "r1",
      nodeId: "n1",
      userId: "owner",
      completedAt: 100,
    },
    {
      _id: "p2",
      roadmapId: "r1",
      nodeId: "n2",
      userId: "other",
      completedAt: 100,
    },
  ];
  const result = await load(
    "convex/chat/learningMemory.ts",
  ).getProgressContext._handler(ctx, { roadmapId: "r1", userId: "owner" });
  assert.equal(result.length, 1);
  assert.ok(result[0].includes("Closures"));
});

function retrievalSetup(observations = [], recalled = [], fail = false) {
  const ctx = seededContext();
  const searches = [];
  const load = createLoader({
    overrides: {
      ai: {
        ...require("ai"),
        generateText: async () => {
          if (fail) throw new Error("Provider unavailable");
          return { output: { observations } };
        },
      },
      "convex/agents/learning.ts": {
        learningAgent: {
          listMessages: async () => ({
            page: [
              {
                _id: "last",
                text: "JavaScript closures capture variables",
                message: { role: "assistant" },
              },
            ],
          }),
        },
      },
      "@convex-dev/rag": {
        RAG: class {
          async search(ctx, args) {
            searches.push(args);
            return {
              entries: recalled.map((memory) => ({
                metadata: { memoryId: memory._id },
              })),
            };
          }
        },
        contentHashFromArrayBuffer: async (bytes) =>
          createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
      },
    },
  });
  const functions = load("convex/chat/learningMemory.ts");
  ctx.runMutation = async (ref, args) =>
    functions[getFunctionName(ref).split(":")[1]]._handler(ctx, args);
  ctx.runQuery = async (ref, args) =>
    functions[getFunctionName(ref).split(":")[1]]._handler(ctx, args);
  if (recalled.length) ctx.tables.learningMemories = recalled;
  return {
    ctx,
    searches,
    prepare: load("convex/chat/learningRetrieval.ts").prepareLearningContext,
  };
}

test("implicit-topic feedback affects the current answer and is retrieved in a later chat", async () => {
  const setup = retrievalSetup([
    {
      topic: "JavaScript closures",
      feedback: "understood",
      pace: null,
      evidence: "I understand now",
    },
  ]);
  const roadmap = setup.ctx.tables.roadmaps[0];
  const result = await setup.prepare(
    setup.ctx,
    roadmap,
    "t1",
    "I understand now",
  );
  assert.ok(result.context.includes("concepts avancés"));
  assert.ok(result.query.includes("JavaScript closures"));
  assert.equal(setup.searches[0].namespace, "learner:owner");
  const memory = setup.ctx.tables.learningMemories[0];
  const later = retrievalSetup([], [memory]);
  const recalled = await later.prepare(
    later.ctx,
    roadmap,
    "t2",
    "Explain JavaScript closures",
  );
  assert.ok(recalled.context.includes("concepts avancés"));
});

test("unsupported evidence and ordinary questions do not create learning claims", async () => {
  for (const observations of [
    [],
    [
      {
        topic: "JavaScript",
        feedback: "understood",
        pace: null,
        evidence: "invented quote",
      },
    ],
  ]) {
    const setup = retrievalSetup(observations);
    await setup.prepare(
      setup.ctx,
      setup.ctx.tables.roadmaps[0],
      "t1",
      "Explain JavaScript",
    );
    assert.equal(setup.ctx.tables.learningMemories?.length ?? 0, 0);
  }
});

test("extraction failure still allows tutoring with prior memory", async () => {
  const memory = {
    _id: "m1",
    userId: "owner",
    topic: "javascript",
    depth: 0,
    pace: "slow",
    feedback: "struggling",
    evidence: "too hard",
    updatedAt: 100,
    understoodCount: 0,
    difficultyCount: 1,
  };
  const setup = retrievalSetup([], [memory], true);
  const result = await setup.prepare(
    setup.ctx,
    setup.ctx.tables.roadmaps[0],
    "t2",
    "Explain JavaScript",
  );
  assert.ok(result.context.includes("fondations"));
});

test("passed quiz progress is indexed as evidence and changes the content fingerprint", async () => {
  const { roadmapKnowledge } = createLoader()("convex/chat/rag.ts");
  const roadmap = { topic: "JavaScript" };
  const text = roadmapKnowledge(roadmap, ["Quiz réussi : Closures."]);
  assert.ok(text.includes("Quiz réussi : Closures."));
  assert.notEqual(text, roadmapKnowledge(roadmap));
});
