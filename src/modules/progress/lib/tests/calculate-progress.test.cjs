/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const ts = require("typescript");
const compiled = ts.transpileModule(
  readFileSync(require.resolve("../calculate-progress.ts"), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
);
const moduleExports = {};
new Function("exports", compiled.outputText)(moduleExports);
const { calculateProgress } = moduleExports;

test("combines passed quizzes with score-weighted project progress", () => {
  const result = calculateProgress(
    ["a", "b"],
    ["a"],
    ["p", "q"],
    {
      p: { bestScore: 8, passed: true },
      q: { bestScore: null, passed: false },
    },
    2,
  );
  assert.equal(result.quizProgress, 50);
  assert.equal(result.projectProgress, 40);
  assert.equal(result.overallProgress, 45);
  assert.equal(result.averageScore, 8);
  assert.equal(result.evaluatedProjects, 1);
  assert.equal(result.passedProjects, 1);
});
test("ignores duplicate and stale completions and unrelated projects", () => {
  const result = calculateProgress(
    ["a", "a"],
    ["a", "a", "deleted"],
    ["p", "p"],
    {
      p: { bestScore: 10, passed: true },
      unrelated: { bestScore: 10, passed: true },
    },
    1,
  );
  assert.equal(result.overallProgress, 100);
  assert.equal(result.completedQuizzes, 1);
  assert.equal(result.evaluatedProjects, 1);
});
test("reserves project progress before projects have been generated", () => {
  const result = calculateProgress(["a"], ["a"], [], {}, 10);
  assert.equal(result.overallProgress, 50);
  assert.equal(result.totalProjects, 10);
  assert.equal(result.averageScore, null);
});
test("empty roadmap starts at zero and evaluated failures earn partial credit", () => {
  assert.equal(calculateProgress([], [], [], {}, 0).overallProgress, 0);
  const result = calculateProgress(
    ["a"],
    [],
    ["p"],
    { p: { bestScore: 3, passed: false } },
    1,
  );
  assert.equal(result.overallProgress, 15);
  assert.equal(result.passedProjects, 0);
});
