/* eslint-disable @typescript-eslint/no-require-imports -- Local Node regression tests. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { createLoader } = require("./test.helpers.cjs");

const roadmap = {
  _id: "r1",
  userId: "owner",
  topic: "TypeScript",
  summary: "LONG SUMMARY",
  roadmapData: {
    sections: [
      {
        title: "Types",
        centerNodes: [{ label: "Bases" }],
        leftNodes: [{ kind: "topic", label: "Unions" }],
        rightNodes: [
          {
            kind: "choice",
            label: "Framework",
            options: [
              { label: "React", recommendation: "recommended", note: "Web" },
            ],
          },
        ],
      },
    ],
  },
};

function setup(existing = null) {
  const calls = [];
  class RAG {
    async findEntryByContentHash(ctx, args) {
      calls.push(["find", args]);
      return existing;
    }
    async add(ctx, args) {
      calls.push(["add", args]);
      return { replacedEntry: { entryId: "old" } };
    }
    async delete(ctx, args) {
      calls.push(["delete", args]);
    }
    async search(ctx, args) {
      calls.push(["search", args]);
      return { text: "R".repeat(20000) };
    }
  }
  const load = createLoader({
    overrides: {
      "@convex-dev/rag": {
        RAG,
        contentHashFromArrayBuffer: async (bytes) =>
          createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
      },
    },
  });
  return { load, calls, ...load("convex/chat/rag.ts") };
}

test("indexes roadmap content, scopes retrieval and bounds the prompt context", async () => {
  const { retrieveTutorContext, calls } = setup();
  const result = await retrieveTutorContext({}, roadmap, "Explain unions");
  assert.equal(result.length, 12000);
  const added = calls.find(([name]) => name === "add")[1];
  for (const text of [
    "LONG SUMMARY",
    "Types",
    "Bases",
    "Unions",
    "React",
    "Web",
  ]) {
    assert.ok(added.text.includes(text));
  }
  const search = calls.find(([name]) => name === "search")[1];
  assert.equal(search.namespace, "tutor:owner:r1");
  assert.equal(search.query, "Explain unions");
  assert.equal(search.filters[0].value, added.contentHash);
  assert.deepEqual(calls.find(([name]) => name === "delete")[1], {
    entryId: "old",
  });
});

test("unchanged content skips embedding and changed content gets a new revision", async () => {
  const cached = setup({ status: "ready" });
  await cached.retrieveTutorContext({}, roadmap, "Types?");
  assert.ok(!cached.calls.some(([name]) => name === "add"));
  const firstHash = cached.calls[0][1].contentHash;
  await cached.retrieveTutorContext(
    {},
    { ...roadmap, summary: "Updated" },
    "Types?",
  );
  assert.notEqual(cached.calls[2][1].contentHash, firstHash);
});

test("prompt uses retrieved passages and retains learning preferences", () => {
  const { load } = setup();
  const prompt = load("convex/chat/prompts.ts").buildTutorPrompt(
    roadmap,
    { learning_resource: "youtube", level: "beginner" },
    "RETRIEVED PASSAGE",
  );
  assert.ok(prompt.includes("RETRIEVED PASSAGE"));
  assert.ok(!prompt.includes("LONG SUMMARY"));
  assert.ok(prompt.includes("level : beginner"));
  assert.ok(prompt.includes("## Mots-clés YouTube"));
});

test("chat rejects a different roadmap or owner before retrieval", async () => {
  const { load } = setup();
  const action = load("convex/chat/action.ts").sendMessage;
  for (const session of [
    { userId: "owner", roadmapId: "other" },
    { userId: "stranger", roadmapId: "r1" },
  ]) {
    let queries = 0;
    await assert.rejects(
      action._handler(
        {
          auth: { getUserIdentity: async () => ({ subject: "owner" }) },
          runQuery: async () => {
            queries++;
            return session;
          },
        },
        { threadId: "t1", roadmapId: "r1", content: "Question" },
      ),
      /Introuvable/,
    );
    assert.equal(queries, 1);
  }
});
