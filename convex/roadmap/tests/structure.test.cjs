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

test("roadmap uses one Nemotron 3 Ultra request and preserves renderable content", async () => {
  const requests = [];
  const options = [
    { id: "shared", label: "React", recommendation: "recommended", note: null },
    {
      id: "shared",
      label: "Vue",
      recommendation: "recommended",
      note: "Alternative",
    },
  ];
  const output = {
    title: "Learning",
    domainCoverageChecklist: ["Tools", "Tests"],
    sections: Array.from({ length: 6 }, (_, index) => ({
      id: "shared",
      title: `Phase ${index}`,
      centerNodes: [{ id: "shared", label: "Core" }],
      leftNodes: [
        { kind: "choice", id: "shared", label: "Choose", options },
        ...Array.from({ length: 2 }, () => ({
          kind: "topic",
          id: "shared",
          label: "Topic",
        })),
      ],
      rightNodes: Array.from({ length: 3 }, () => ({
        kind: "topic",
        id: "shared",
        label: "Topic",
      })),
    })),
  };
  const loader = createLoader({
    overrides: {
      ai: {
        generateText: async (request) => {
          requests.push(request);
          return { output: request.output.schema.parse(output) };
        },
        Output: { object: (args) => args },
      },
      "convex/ai/provider.ts": { gateway: (model) => model },
    },
  });
  const { generateRoadmap } = loader("convex/roadmap/generation/pipeline.ts");
  const result = await generateRoadmap({
    topic: "TypeScript",
    answers: [{ key: "goal", value: "Build apps" }],
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].model, "nvidia/nemotron-3-ultra-550b-a55b");
  assert.match(requests[0].prompt, /goal: Build apps/);
  assert.match(requests[0].prompt, /prérequis/);
  assert.equal(
    result.summary,
    "Roadmap complète couvrant 6 phases : Tools, Tests.",
  );
  assert.equal(result.roadmapData.sections.length, 6);
  const ids = [];
  for (const section of result.roadmapData.sections) {
    ids.push(section.id, ...section.centerNodes.map((node) => node.id));
    for (const entry of [...section.leftNodes, ...section.rightNodes]) {
      ids.push(entry.id);
      if (entry.kind === "choice") {
        ids.push(...entry.options.map((option) => option.id));
        assert.equal(
          entry.options.filter(
            (option) => option.recommendation === "recommended",
          ).length,
          1,
        );
        assert.equal(entry.options[0].note, undefined);
      }
    }
  }
  assert.equal(new Set(ids).size, ids.length);
  await generateRoadmap({ topic: "TypeScript" });
  assert.match(requests[1].prompt, /public débutant/);
});

test("roadmap propagates model failures without invoking fallback agents", async () => {
  let calls = 0;
  const loader = createLoader({
    overrides: {
      ai: {
        generateText: async () => {
          calls++;
          throw Error("Gateway failure");
        },
        Output: { object: (args) => args },
      },
      "convex/ai/provider.ts": { gateway: (model) => model },
    },
  });
  await assert.rejects(
    loader("convex/roadmap/generation/pipeline.ts").generateRoadmap({
      topic: "TypeScript",
    }),
    /Gateway failure/,
  );
  assert.equal(calls, 1);
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
          {
            kind: "choice",
            id: "left",
            label: "Choose",
            options: options.map((option) => ({ ...option, note: undefined })),
          },
          { kind: "topic", id: "left-3", label: "Gap" },
        ],
        rightNodes: [
          {
            kind: "choice",
            id: "left-2",
            label: "Choose",
            options: options.map((option) => ({ ...option, note: undefined })),
          },
        ],
      },
    ],
  });
  assert.equal(output.sections[0].leftNodes[0].options[0].note, undefined);
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
