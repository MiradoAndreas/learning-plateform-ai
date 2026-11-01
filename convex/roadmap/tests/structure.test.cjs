/* eslint-disable @typescript-eslint/no-require-imports -- Local Node regressions, with no network or AI calls. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { toJSONSchema } = require("zod");
const { createLoader } = require("../../tests/test.helpers.cjs");
const fixtures = require("./generation-fixtures.json");

const phase = {
  id: "basics",
  title: "Basics",
  goal: "Learn",
  prerequisites: [],
};
const skeleton = {
  title: "Learning",
  domainCoverageChecklist: ["Tools"],
  phases: [phase],
};
const details = {
  basics: {
    centerNodes: [{ id: "core", label: "Core" }],
    leftNodes: [{ kind: "topic", id: "left", label: "Left" }],
    rightNodes: [{ kind: "topic", id: "right", label: "Right" }],
  },
};
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

for (const [name, args, fixture] of [
  [
    "generatePhaseSkeleton",
    { topic: "TypeScript", answers: [{ key: "goal", value: "Build" }] },
    "generatePhaseSkeleton",
  ],
  [
    "generatePhaseSkeleton",
    { topic: "TypeScript", answers: [] },
    "generatePhaseSkeletonWithoutAnswers",
  ],
  [
    "generatePhaseDetails",
    { roadmapTopic: "TypeScript", skeleton, phase },
    "generatePhaseDetails",
  ],
  ["auditGaps", { roadmapTopic: "TypeScript", skeleton, details }, "auditGaps"],
  [
    "addChoices",
    { roadmapTopic: "TypeScript", skeleton, details },
    "addChoices",
  ],
]) {
  test(
    name + " preserves its exact prompt, schema, model and output",
    async () => {
      let request;
      const output = { result: true };
      const loader = createLoader({
        overrides: {
          ai: {
            generateText: async (args) => {
              request = { ...args, output: toJSONSchema(args.output.schema) };
              return { output };
            },
            Output: { object: (args) => args },
          },
          "convex/ai/provider.ts": {
            gateway: (model) => model.replace(/^openai\//, ""),
          },
        },
      });
      assert.equal(
        await loader("convex/roadmap/generation/stages.ts")[name](args),
        output,
      );
      assert.equal(hash(request), fixtures[fixture]);
    },
  );
}

test("pipeline preserves stage ordering, parallel phase details and final summary", async () => {
  const events = [];
  const phase2 = { ...phase, id: "practice", title: "Practice" };
  const plan = { ...skeleton, phases: [phase, phase2] };
  const generatedDetails = {
    basics: details.basics,
    practice: { ...details.basics },
  };
  const pending = new Map();
  const audit = { additions: [] };
  const choices = { replacements: [] };
  const merged = { title: "Learning", sections: [] };
  const loader = createLoader({
    overrides: {
      "convex/roadmap/generation/stages.ts": {
        generatePhaseSkeleton: async (input) => {
          events.push(["skeleton", input]);
          return plan;
        },
        generatePhaseDetails: async (input) => {
          events.push(["details", input.phase.id]);
          await new Promise((resolve) => {
            pending.set(input.phase.id, resolve);
            if (pending.size === 2) for (const done of pending.values()) done();
          });
          return generatedDetails[input.phase.id];
        },
        auditGaps: async (input) => {
          events.push(["audit", input]);
          return audit;
        },
        addChoices: async (input) => {
          events.push(["choices", input]);
          return choices;
        },
      },
      "convex/roadmap/generation/merge.ts": {
        mergeRoadmap: (input) => {
          events.push(["merge", input]);
          return merged;
        },
      },
    },
  });
  const result = await loader(
    "convex/roadmap/generation/pipeline.ts",
  ).generateRoadmap({ topic: "TypeScript" });
  assert.deepEqual(
    events.map(([name]) => name),
    ["skeleton", "details", "details", "audit", "choices", "merge"],
  );
  assert.deepEqual(events[0][1], { topic: "TypeScript", answers: [] });
  assert.deepEqual(events[3][1], {
    roadmapTopic: "TypeScript",
    skeleton: plan,
    details: generatedDetails,
  });
  assert.deepEqual(events[5][1], {
    skeleton: plan,
    details: generatedDetails,
    gapAudit: audit,
    choicePass: choices,
  });
  assert.deepEqual(result, {
    title: "Learning",
    summary: "Roadmap complète couvrant 2 phases : Tools.",
    roadmapData: merged,
  });
});

test("merge retains replacement options, unique IDs, addition order and existing null-note behavior", () => {
  const loader = createLoader();
  const options = [
    {
      id: "option",
      label: "Option",
      recommendation: "recommended",
      note: null,
    },
  ];
  const output = loader("convex/roadmap/generation/merge.ts").mergeRoadmap({
    skeleton,
    details: {
      basics: {
        ...details.basics,
        rightNodes: [{ kind: "topic", id: "left", label: "Duplicate" }],
      },
    },
    gapAudit: {
      additions: [
        {
          targetPhaseId: "basics",
          side: "left",
          entries: [{ kind: "topic", id: "left", label: "Gap" }],
          reason: "Prerequisite",
        },
      ],
    },
    choicePass: {
      replacements: [{ entryId: "left", label: "Choose", options }],
    },
  });
  assert.deepEqual(output, {
    title: "Learning",
    sections: [
      {
        id: "basics",
        title: "Basics",
        centerNodes: [{ id: "core", label: "Core" }],
        leftNodes: [
          { kind: "choice", id: "left", label: "Choose", options },
          { kind: "topic", id: "left-3", label: "Gap" },
        ],
        rightNodes: [
          { kind: "choice", id: "left-2", label: "Choose", options },
        ],
      },
    ],
  });
  assert.equal(output.sections[0].leftNodes[0].options, options);
});

test("roadmap refactor adds and removes no registered endpoints", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const { root } = require("../../tests/test.helpers.cjs");
  const baseline = require("../../tests/fixtures/contracts.json");
  const expected = Object.keys(baseline.contracts).filter((name) =>
    name.startsWith("roadmap/"),
  );
  const canonical = {
    projects: ["listProjects", "saveProjects"],
    progress: ["getQuiz", "saveQuiz"],
    questions: [
      "getPreferences",
      "listQuestions",
      "saveGeneratedQuestions",
      "saveAnswers",
    ],
    submissions: [
      "getSubmission",
      "getProject",
      "setSubmissionReviewing",
      "setSubmissionResult",
      "setSubmissionFailed",
      "setSubmissionStatus",
      "setSubmissionCoverage",
      "insertFileBatch",
      "getFileBatch",
      "setFileBatchResult",
      "listFileBatches",
    ],
  };
  for (const [domain, names] of Object.entries(canonical))
    for (const name of names)
      expected.push("roadmap/" + domain + "/internal:" + name);
  const actual = [];
  const loader = createLoader();
  function inspect(dir) {
    for (const entry of fs.readdirSync(path.join(root, "convex", dir), {
      withFileTypes: true,
    })) {
      const file = dir + "/" + entry.name;
      if (entry.isDirectory()) inspect(file);
      else if (file.endsWith(".ts"))
        for (const [name, fn] of Object.entries(loader("convex/" + file))) {
          if (fn?.isQuery || fn?.isMutation || fn?.isAction)
            actual.push(file.replace(/\.ts$/, "") + ":" + name);
        }
    }
  }
  inspect("roadmap");
  assert.deepEqual(actual.sort(), expected.sort());
});

test("extracted project and quiz generation retain ownership checks and cached results", async () => {
  const { getFunctionName } = require("convex/server");
  const loader = createLoader({
    overrides: {
      "convex/agents/learning.ts": {
        learningAgent: {
          createThread: async () => {
            throw Error("Unexpected AI call");
          },
        },
      },
    },
  });
  const actions = loader("convex/roadmap/action.ts");
  const args = { roadmapId: "r1", nodeId: "n1", nodeLabel: "Basics" };
  for (const name of ["generateRoadmapProjects", "getOrCreateNodeQuiz"]) {
    const context = {
      auth: { getUserIdentity: async () => null },
      runQuery: async () => {
        throw Error("Unexpected read");
      },
    };
    await assert.rejects(actions[name]._handler(context, args), {
      message: "Non authentifié",
    });
    context.auth.getUserIdentity = async () => ({ subject: "owner" });
    context.runQuery = async () => ({ userId: "other" });
    await assert.rejects(actions[name]._handler(context, args), {
      message: "Introuvable",
    });
  }
  const ctx = {
    auth: { getUserIdentity: async () => ({ subject: "owner" }) },
    runQuery: async (ref) => {
      const name = getFunctionName(ref);
      if (name.endsWith(":getRoadmap"))
        return { userId: "owner", topic: "TypeScript" };
      if (name.endsWith(":getRoadmapProjectsInternal"))
        return [{ title: "Existing" }];
      if (name.endsWith(":getNodeQuiz"))
        return {
          _id: "q1",
          questions: [{ question: "Q", options: ["A", "B"], correctIndex: 1 }],
        };
      throw Error("Unexpected query " + name);
    },
  };
  assert.equal(
    await actions.generateRoadmapProjects._handler(ctx, args),
    undefined,
  );
  assert.deepEqual(await actions.getOrCreateNodeQuiz._handler(ctx, args), {
    quizId: "q1",
    questions: [{ question: "Q", options: ["A", "B"] }],
  });
});
