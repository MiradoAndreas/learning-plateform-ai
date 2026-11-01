/* eslint-disable @typescript-eslint/no-require-imports -- Runs directly in Node without installing a test framework. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { getFunctionName } = require("convex/server");
const JSZip = require("jszip");
const { createLoader, createContext } = require("./test.helpers.cjs");
const baseline = require("./fixtures/contracts.json");
const behavior = require("./fixtures/behavior.json");
const { createHash } = require("node:crypto");
const fingerprint = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const load = createLoader();
const endpoint = (name, loader = load) => {
  const [file, symbol] = name.split(":");
  return loader("convex/" + file + ".ts")[symbol];
};
const run = (name, ctx, args, loader = load) =>
  endpoint(name, loader)._handler(ctx, args);
const roadmap = {
  _id: "r1",
  _creationTime: 1,
  userId: "owner",
  topic: "TypeScript",
  status: "draft",
};
const project = {
  _id: "p1",
  _creationTime: 2,
  roadmapId: "r1",
  level: "Novice",
  order: 0,
  title: "Project",
  description: "Build",
  objectives: [],
  skillsPracticed: [],
};
const seed = { roadmaps: [roadmap], roadmapProjects: [project] };

test("persisted table names, fields, optionality, enums and indexes are unchanged", () => {
  assert.deepEqual(
    JSON.parse(load("convex/schema.ts").default.export()),
    baseline.schema,
  );
});

test("all 61 historical endpoint paths preserve visibility, kind and argument validators", () => {
  for (const [name, expected] of Object.entries(baseline.contracts)) {
    const fn = endpoint(name);
    assert.ok(fn, name);
    assert.equal(
      fn.isQuery ? "query" : fn.isMutation ? "mutation" : "action",
      expected.kind,
      name,
    );
    assert.equal(
      fn.isPublic ? "public" : "internal",
      expected.visibility,
      name,
    );
    assert.deepEqual(JSON.parse(fn.exportArgs()), expected.args, name);
    // WorkflowManager validates its handler result internally, not on the registered wrapper.
    if (
      name !==
      "roadmap/submissions/submissionsWorkflow:reviewSubmissionWorkflow"
    ) {
      assert.notEqual(
        JSON.parse(fn.exportReturns()),
        null,
        name + " must validate its response",
      );
    }
  }
});

test("new domain modules do not introduce public endpoints", () => {
  for (const file of [
    "roadmap/questions/internal",
    "roadmap/progress/internal",
    "roadmap/projects/internal",
    "roadmap/submissions/internal",
  ]) {
    for (const fn of Object.values(load("convex/" + file + ".ts"))) {
      if (fn?.isQuery || fn?.isMutation || fn?.isAction)
        assert.equal(fn.isPublic, undefined);
    }
  }
});

test("roadmap and submission reads reject missing identity and other owners", async () => {
  const calls = [
    ["roadmap/queries:getRoadmap", { roadmapId: "r1" }],
    ["roadmap/queries:getRoadmapQuestions", { roadmapId: "r1" }],
    ["roadmap/queries:getRoadmapProjects", { roadmapId: "r1" }],
    ["roadmap/queries:getRoadmapProgress", { roadmapId: "r1" }],
    ["chat/queries:listSessions", { roadmapId: "r1" }],
    ["roadmap/submissions/queries:listProjectSubmissions", { projectId: "p1" }],
    [
      "roadmap/submissions/queries:getSubmissionsSummaryByRoadmap",
      { roadmapId: "r1" },
    ],
    [
      "roadmap/submissions/mutation:submitProject",
      {
        roadmapId: "r1",
        projectId: "p1",
        storageId: "s1",
        fileName: "code.zip",
      },
    ],
  ];
  for (const [name, args] of calls) {
    await assert.rejects(run(name, createContext(seed, null), args), {
      message: "Non authentifié",
    });
    await assert.rejects(run(name, createContext(seed, "other"), args), {
      message: "Introuvable",
    });
  }
});

test("chat ownership and rename validation preserve error order", async () => {
  const ctx = createContext({
    ...seed,
    roadmapThreads: [{ _id: "t1", threadId: "agent1", userId: "other" }],
  });
  for (const name of ["getSession", "listThreadMessages"]) {
    await assert.rejects(
      run("chat/queries:" + name, ctx, {
        threadId: "agent1",
        paginationOpts: { numItems: 10, cursor: null },
      }),
      { message: "Introuvable" },
    );
  }
  await assert.rejects(
    run("chat/mutation:renameSession", ctx, {
      threadId: "agent1",
      title: "  ",
    }),
    { message: "Le titre ne peut pas être vide" },
  );
  await assert.rejects(
    run("chat/mutation:renameSession", ctx, {
      threadId: "agent1",
      title: "x".repeat(81),
    }),
    { message: "Le titre est trop long" },
  );
  await assert.rejects(
    run("chat/mutation:renameSession", ctx, {
      threadId: "agent1",
      title: "Valid",
    }),
    { message: "Introuvable" },
  );
});

test("chat rename trims the title and synchronizes component metadata", async () => {
  const ctx = createContext({
    roadmapThreads: [{ _id: "t1", threadId: "agent1", userId: "owner" }],
  });
  const calls = [];
  ctx.runMutation = async (ref, args) => calls.push(args);
  await run("chat/mutation:renameSession", ctx, {
    threadId: "agent1",
    title: "  Valid title  ",
  });
  assert.equal(ctx.tables.roadmapThreads[0].title, "Valid title");
  assert.deepEqual(calls, [
    { threadId: "agent1", patch: { title: "Valid title" } },
  ]);
});

test("roadmap lists preserve user scope, descending order, and dashboard overflow item", async () => {
  const rows = Array.from({ length: 8 }, (_, i) => ({
    ...roadmap,
    _id: "r" + i,
    _creationTime: i,
  }));
  const ctx = createContext({
    roadmaps: [
      ...rows,
      { ...roadmap, _id: "other", userId: "other", _creationTime: 50 },
    ],
  });
  const recent = await run("roadmap/queries:getRecentRoadmaps", ctx, {});
  assert.deepEqual(
    recent.map((row) => row._id),
    ["r7", "r6", "r5", "r4", "r3", "r2"],
  );
  assert.equal(
    (await run("roadmap/queries:listMyRoadmaps", ctx, {})).length,
    8,
  );
});

test("project and question readers retain canonical order", async () => {
  const ctx = createContext({
    ...seed,
    roadmapProjects: [{ ...project, _id: "p2", order: 1 }, project],
    roadmap_questions: [
      { _id: "q2", roadmapId: "r1", order: 1 },
      { _id: "q1", roadmapId: "r1", order: 0 },
    ],
  });
  assert.deepEqual(
    (
      await run("roadmap/queries:getRoadmapProjects", ctx, { roadmapId: "r1" })
    ).map((r) => r._id),
    ["p1", "p2"],
  );
  assert.deepEqual(
    (
      await run("roadmap/queries:getRoadmapQuestions", ctx, { roadmapId: "r1" })
    ).map((r) => r._id),
    ["q1", "q2"],
  );
});

test("quiz threshold and completion idempotence are unchanged", async () => {
  const quiz = {
    _id: "quiz1",
    roadmapId: "r1",
    nodeId: "node1",
    questions: Array.from({ length: 5 }, () => ({
      question: "Q",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
    })),
  };
  const ctx = createContext({ ...seed, roadmapNodeQuizzes: [quiz] });
  const args = { roadmapId: "r1", nodeId: "node1", quizId: "quiz1" };
  assert.deepEqual(
    await run("roadmap/mutation:submitNodeQuiz", ctx, {
      ...args,
      answers: [0, 0, 0, 1, 1],
    }),
    { passed: false, score: 0.6, correctCount: 3, total: 5 },
  );
  assert.equal(ctx.tables.roadmapNodeProgress, undefined);
  assert.deepEqual(
    await run("roadmap/mutation:submitNodeQuiz", ctx, {
      ...args,
      answers: [0, 0, 0, 0, 1],
    }),
    { passed: true, score: 0.8, correctCount: 4, total: 5 },
  );
  await run("roadmap/mutation:submitNodeQuiz", ctx, {
    ...args,
    answers: [0, 0, 0, 0, 0],
  });
  assert.equal(ctx.tables.roadmapNodeProgress.length, 1);
  await assert.rejects(
    run("roadmap/mutation:submitNodeQuiz", ctx, { ...args, answers: [] }),
    { message: "Réponses incomplètes" },
  );
  await assert.rejects(
    run("roadmap/mutation:submitNodeQuiz", ctx, {
      ...args,
      nodeId: "wrong",
      answers: [],
    }),
    { message: "Quiz introuvable" },
  );
});

test("quiz responses omit correct answers", () => {
  assert.deepEqual(
    load("convex/roadmap/progress/model.ts").toClientQuiz("quiz1", [
      { question: "Q", options: ["A"], correctIndex: 0 },
    ]),
    { quizId: "quiz1", questions: [{ question: "Q", options: ["A"] }] },
  );
});

test("progress preserves left-before-right ordering and stops at the first locked node", async () => {
  const data = {
    title: "Roadmap",
    sections: [
      {
        id: "s",
        title: "S",
        centerNodes: [{ id: "center", label: "Center" }],
        leftNodes: [
          { kind: "topic", id: "a", label: "A" },
          { kind: "topic", id: "b", label: "B" },
        ],
        rightNodes: [
          { kind: "topic", id: "c", label: "C" },
          { kind: "topic", id: "d", label: "D" },
        ],
      },
    ],
  };
  const ctx = createContext({
    roadmaps: [{ ...roadmap, roadmapData: data }],
    roadmapNodeProgress: [{ roadmapId: "r1", nodeId: "a" }],
  });
  assert.deepEqual(
    await run("roadmap/queries:getRoadmapProgress", ctx, { roadmapId: "r1" }),
    {
      orderedNodeIds: ["a", "b", "c", "d"],
      completedNodeIds: ["a"],
      unlockedNodeIds: ["a", "b"],
    },
  );
  assert.deepEqual(
    load("convex/roadmap/progress/model.ts").getUnlockedNodeIds(
      ["a", "b", "c", "d"],
      new Set(["c"]),
    ),
    ["a"],
  );
  assert.deepEqual(
    await run("roadmap/queries:getRoadmapProgress", createContext(seed), {
      roadmapId: "r1",
    }),
    { orderedNodeIds: [], completedNodeIds: [], unlockedNodeIds: [] },
  );
});

test("question normalization, deduplication, canonical resource question, and preferences are unchanged", async () => {
  const ctx = createContext(seed);
  const question = {
    key: "Expérience préférée",
    title: "Experience",
    required: true,
    options: ["A"],
  };
  await run("roadmap/internal:saveGeneratedQuestions", ctx, {
    roadmapId: "r1",
    questions: [
      question,
      { ...question, key: "experience_preferee" },
      { ...question, key: "preferred_learning_resource" },
    ],
  });
  assert.deepEqual(
    ctx.tables.roadmap_questions.map((q) => q.key),
    ["experience_preferee", "preferred_learning_resource"],
  );
  assert.equal(ctx.tables.roadmap_questions[0].description, null);
  assert.equal(ctx.tables.roadmaps[0].status, "awaiting_answers");
  await run("roadmap/internal:saveAnswers", ctx, {
    roadmapId: "r1",
    answers: [
      { key: "experience_preferee", value: "A" },
      { key: "missing", value: "Ignored" },
    ],
  });
  assert.deepEqual(
    await run("roadmap/internal:getRoadmapPreferences", ctx, {
      roadmapId: "r1",
    }),
    { experience_preferee: "A" },
  );
  assert.equal(ctx.tables.roadmaps[0].status, "generating_roadmap");
});

test("submission summary counts all attempts and scores only completed reviews", async () => {
  const reviews = [
    { projectId: "p1", status: "uploaded", score: 10 },
    { projectId: "p1", status: "completed", score: 4, passed: false },
    { projectId: "p1", status: "completed", score: 7, passed: true },
    { projectId: "p1", status: "failed", score: 9 },
    { projectId: "p2", status: "reviewing" },
  ].map((r, i) => ({ ...r, _id: "s" + i, roadmapId: "r1", userId: "owner" }));
  const ctx = createContext({
    ...seed,
    roadmapProjectSubmissions: [
      ...reviews,
      {
        projectId: "p1",
        roadmapId: "r1",
        userId: "other",
        status: "completed",
        score: 10,
        passed: true,
      },
    ],
  });
  assert.deepEqual(
    await run(
      "roadmap/submissions/queries:getSubmissionsSummaryByRoadmap",
      ctx,
      { roadmapId: "r1" },
    ),
    {
      p1: { attempts: 4, bestScore: 7, passed: true },
      p2: { attempts: 1, bestScore: null, passed: false },
    },
  );
});

test("both historical workflow callback paths share one implementation", async () => {
  const first = endpoint(
    "roadmap/submissions/submissionsWorkflow:handleSubmissionReviewComplete",
  );
  assert.equal(
    first,
    endpoint(
      "roadmap/submissions/submissionsWorkflowComplete:handleSubmissionReviewComplete",
    ),
  );
  for (const result of [
    { kind: "success", returnValue: null },
    { kind: "failed", error: "Failure" },
    { kind: "canceled" },
  ]) {
    const ctx = createContext({
      roadmapProjectSubmissions: [{ _id: "s1", status: "completed" }],
    });
    await first._handler(ctx, { workflowId: "w1", result, context: "s1" });
    if (result.kind === "success") assert.equal(ctx.writes.length, 0);
    else {
      assert.equal(ctx.tables.roadmapProjectSubmissions[0].status, "failed");
      assert.equal(
        ctx.tables.roadmapProjectSubmissions[0].errorMessage,
        result.kind === "failed"
          ? "Failure"
          : "L'analyse a été annulée avant sa fin",
      );
    }
  }
});

test("submission file filtering retains existing extension, folder and lockfile rules", () => {
  const { isRelevantFile } = load("convex/roadmap/submissions/archive.ts");
  for (const name of ["src/INDEX.TS", "main.py", "README.md", "data.json"])
    assert.equal(isRelevantFile(name), true, name);
  for (const name of [
    "node_modules/pkg/index.ts",
    "dist/main.js",
    ".git/config.json",
    "package-lock.json",
    "yarn.lock",
    "image.png",
    "coverage/report.html",
  ])
    assert.equal(isRelevantFile(name), false, name);
  assert.equal(
    load("convex/roadmap/constants.ts").isRelevantFile,
    isRelevantFile,
  );
});

const entry = (name, size) => ({ name, async: async () => "x".repeat(size) });
test("batching preserves exact-budget files, ordering, formatting, and per-file truncation", async () => {
  const { chunkSubmissionFiles, formatFileBatch } = load(
    "convex/roadmap/submissions/archive.ts",
  );
  const result = await chunkSubmissionFiles([
    entry("a.ts", 15000),
    entry("b.ts", 15000),
    entry("c.ts", 1),
  ]);
  assert.deepEqual(
    result.batches.map((b) => b.map((f) => f.path)),
    [["a.ts", "b.ts"], ["c.ts"]],
  );
  assert.equal(result.filesIncluded, 3);
  assert.equal(result.truncated, false);
  assert.equal(
    formatFileBatch([{ path: "a.ts", content: "hello" }]),
    "### a.ts\n" + "```\nhello\n" + "```",
  );
  const single = await chunkSubmissionFiles([entry("large.ts", 20001)]);
  assert.ok(single.batches[0][0].content.startsWith("x".repeat(20000)));
  assert.ok(single.batches[0][0].content.includes("20001 caractères au total"));
  assert.equal(single.truncated, false); // Existing flag reports batch-limit truncation only.
});

test("batch safety ceiling preserves coverage and truncation semantics", async () => {
  const { chunkSubmissionFiles } = load(
    "convex/roadmap/submissions/archive.ts",
  );
  const files = Array.from({ length: 26 }, (_, i) => entry(i + ".ts", 20000));
  const result = await chunkSubmissionFiles(files);
  assert.equal(result.batches.length, 25);
  assert.equal(result.filesIncluded, 25);
  assert.equal(result.truncated, true);
  assert.equal(
    (await chunkSubmissionFiles(files.slice(0, 25))).truncated,
    false,
  );
});

async function extract(loader, zip) {
  const calls = [];
  let index = 0;
  const ctx = {
    runQuery: async () => ({ storageId: "storage1" }),
    storage: { get: async () => (zip === null ? null : new Blob([zip])) },
    runMutation: async (ref, args) => {
      const name = getFunctionName(ref);
      calls.push([name, args]);
      if (name.endsWith(":insertFileBatch")) return "batch" + index++;
    },
  };
  const result = await run(
    "roadmap/submissions/submissionsExtractAction:extractAndChunkSubmission",
    ctx,
    { submissionId: "submission1" },
    loader,
  );
  return { result, calls };
}

test("real ZIP extraction preserves content, status order and coverage", async () => {
  const zip = new JSZip();
  zip.file("src/a.ts", "const a = 1;");
  zip.file("node_modules/pkg/a.ts", "ignored");
  zip.file("image.png", "ignored");
  const result = await extract(
    load,
    await zip.generateAsync({ type: "uint8array" }),
  );
  assert.deepEqual(result.result, { batchIds: ["batch0"], truncated: false });
  assert.deepEqual(
    result.calls.map(([name]) => name),
    [
      "roadmap/internal:setSubmissionStatus",
      "roadmap/internal:insertFileBatch",
      "roadmap/internal:setSubmissionCoverage",
    ],
  );
  assert.deepEqual(result.calls[1][1].filePaths, ["src/a.ts"]);
  assert.deepEqual(result.calls[2][1], {
    submissionId: "submission1",
    totalFilesInProject: 1,
    totalFilesAnalyzed: 1,
    totalBatches: 1,
    truncated: false,
  });
  await assert.rejects(extract(load, null), {
    message: "Fichier introuvable dans le stockage",
  });
  const empty = new JSZip();
  empty.file("image.png", "ignored");
  await assert.rejects(
    extract(load, await empty.generateAsync({ type: "uint8array" })),
    {
      message: "Aucun fichier de code reconnu n'a été trouvé dans l'archive",
    },
  );
});

test("extracted ZIP processing matches the original implementation fingerprint", async () => {
  const zip = new JSZip();
  for (let i = 0; i < 30; i++)
    zip.file("src/" + i + ".ts", "x".repeat(i === 0 ? 20001 : 20000));
  zip.file("pnpm-lock.yaml", "ignored");
  const bytes = await zip.generateAsync({ type: "uint8array" });
  assert.equal(
    fingerprint(await extract(load, bytes)),
    behavior.zipExtractionSha256,
  );
});

test("tutor prompt and thread behavior match the original for every resource branch", async () => {
  for (const { preferences, sha256 } of behavior.tutorBranches) {
    const prompts = [];
    const agent = {
      continueThread: async () => ({
        thread: {
          generateText: async (args) => {
            prompts.push(args);
            return { text: "Reply" };
          },
          getMetadata: async () => ({ title: "Existing" }),
        },
      }),
    };
    const loader = createLoader({
      overrides: { "convex/agents/learning.ts": { learningAgent: agent } },
    });
    const mutations = [];
    const ctx = {
      auth: { getUserIdentity: async () => ({ subject: "owner" }) },
      runQuery: async (ref) => {
        const name = getFunctionName(ref);
        return name.includes("getSessionByThreadId")
          ? { userId: "owner", messageCount: 1 }
          : name.includes("getRoadmapPreferences")
            ? preferences
            : roadmap;
      },
      runMutation: async (ref, args) =>
        mutations.push([getFunctionName(ref), args]),
    };
    const result = await run(
      "chat/action:sendMessage",
      ctx,
      { threadId: "thread1", roadmapId: "r1", content: "Explain" },
      loader,
    );
    assert.equal(fingerprint({ result, prompts, mutations }), sha256);
  }
});

test("question generation keeps the active pre-refactor prompt, schema and model", async () => {
  const { toJSONSchema } = require("zod");
  const outputs = [];
  for (const file of [
    "src/modules/roadmap/lib/roadmap-generator.ts",
    "convex/roadmap/questions/generation.ts",
  ]) {
    const calls = [];
    const provider = (model) => model.replace(/^openai\//, "");
    const loader = createLoader({
      overrides: {
        ai: {
          generateText: async (args) => {
            calls.push({ ...args, output: toJSONSchema(args.output.schema) });
            return { output: { questions: [] } };
          },
          Output: { object: (args) => args },
        },
        "ai.ts": { gateway: provider },
        "convex/ai/provider.ts": { gateway: provider },
      },
    });
    const result = await loader(file).generateQuestions({
      topic: "TypeScript",
    });
    outputs.push({ result, calls });
  }
  assert.deepEqual(outputs[0], outputs[1]);
});

test("submission creation retains validation, initial fields and durable workflow references", async () => {
  const starts = [];
  const loader = createLoader({
    overrides: {
      "convex/workflows/manager.ts": {
        workflow: { start: async (...args) => starts.push(args) },
      },
    },
  });
  const ctx = createContext(seed);
  const args = {
    roadmapId: "r1",
    projectId: "p1",
    storageId: "storage1",
    fileName: "code.ZIP",
  };
  const id = await run(
    "roadmap/submissions/mutation:submitProject",
    ctx,
    args,
    loader,
  );
  assert.equal(ctx.tables.roadmapProjectSubmissions[0]._id, id);
  assert.equal(ctx.tables.roadmapProjectSubmissions[0].status, "uploaded");
  assert.equal(ctx.tables.roadmapProjectSubmissions[0].userId, "owner");
  assert.equal(starts.length, 1);
  assert.equal(
    getFunctionName(starts[0][1]),
    "roadmap/submissions/submissionsWorkflow:reviewSubmissionWorkflow",
  );
  assert.deepEqual(starts[0][2], {
    submissionId: id,
    userId: "owner",
    projectTitle: "Project",
    projectLevel: "Novice",
  });
  assert.equal(
    getFunctionName(starts[0][3].onComplete),
    "roadmap/submissions/submissionsWorkflowComplete:handleSubmissionReviewComplete",
  );
  assert.equal(starts[0][3].context, id);
  await assert.rejects(
    run(
      "roadmap/submissions/mutation:submitProject",
      ctx,
      { ...args, fileName: "code.txt" },
      loader,
    ),
    { message: "Le fichier doit être une archive .zip" },
  );
  await assert.rejects(
    run(
      "roadmap/submissions/mutation:submitProject",
      ctx,
      { ...args, projectId: "missing" },
      loader,
    ),
    { message: "Projet introuvable" },
  );
});

test("review workflow preserves extraction, review status, parallel batch analysis, synthesis and retries", async () => {
  const loader = createLoader({
    overrides: {
      "convex/workflows/manager.ts": {
        workflow: { define: (definition) => definition },
      },
    },
  });
  const definition = loader(
    "convex/roadmap/submissions/submissionsWorkflow.ts",
  ).reviewSubmissionWorkflow;
  const calls = [];
  const step = {
    runAction: async (ref, args, options) => {
      const name = getFunctionName(ref);
      calls.push([name, args, options]);
      if (name.endsWith(":extractAndChunkSubmission"))
        return { batchIds: ["b1", "b2"], truncated: false };
    },
    runMutation: async (ref, args) => calls.push([getFunctionName(ref), args]),
  };
  await definition.handler(step, {
    submissionId: "s1",
    userId: "owner",
    projectTitle: "Project",
    projectLevel: "Novice",
  });
  assert.deepEqual(
    calls.map(([name]) => name),
    [
      "roadmap/submissions/submissionsExtractAction:extractAndChunkSubmission",
      "roadmap/internal:setSubmissionStatus",
      "roadmap/submissions/submissionsAnalyseBatchAction:analyzeFileBatch",
      "roadmap/submissions/submissionsAnalyseBatchAction:analyzeFileBatch",
      "roadmap/submissions/submissionsSynthesizeAction:synthesizeSubmissionReview",
    ],
  );
  assert.deepEqual(calls[1][1], { submissionId: "s1", status: "reviewing" });
  for (const call of calls.filter((_, i) => i !== 1))
    assert.deepEqual(call[2], { retry: true });
});

test("chat exchange ceiling prevents AI calls and preserves the structured error", async () => {
  const ctx = {
    auth: { getUserIdentity: async () => ({ subject: "owner" }) },
    runQuery: async () => ({ userId: "owner", messageCount: 30 }),
  };
  await assert.rejects(
    run("chat/action:sendMessage", ctx, {
      threadId: "t1",
      roadmapId: "r1",
      content: "Hello",
    }),
    (error) => error.data.code === "THREAD_LIMIT_REACHED",
  );
});
