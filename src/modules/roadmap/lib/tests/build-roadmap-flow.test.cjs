/* eslint-disable @typescript-eslint/no-require-imports -- Local Node regression tests. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const ts = require("typescript");
const compiled = ts.transpileModule(
  readFileSync(require.resolve("../build-roadmap-flow.ts"), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
);
const exportsObject = {};
new Function("exports", compiled.outputText)(exportsObject);
const { buildRoadmapFlow } = exportsObject;

for (const centerCount of [1, 2, 3]) {
  test(`${centerCount} center items retain branches and choice options`, () => {
    const centers = Array.from({ length: centerCount }, (_, i) => ({
      id: `center-${i}`,
      label: `Center ${i}`,
    }));
    const topics = (side) =>
      Array.from({ length: 6 }, (_, i) => ({
        kind: "topic",
        id: `${side}-${i}`,
        label: `${side} ${i}`,
      }));
    const leftNodes = topics("left");
    const rightNodes = topics("right");
    rightNodes[0] = {
      kind: "choice",
      id: "choice",
      label: "Choose",
      options: [
        { id: "option", label: "Option", recommendation: "recommended" },
      ],
    };
    const { nodes, edges } = buildRoadmapFlow(
      {
        title: "Test",
        sections: [
          {
            id: "phase",
            title: "Phase",
            centerNodes: centers,
            leftNodes,
            rightNodes,
          },
        ],
      },
      { unlockedNodeIds: new Set(), completedNodeIds: new Set() },
    );
    for (const center of centers) {
      assert.ok(
        edges.some(
          (edge) => edge.source === center.id && !edge.id.startsWith("spine-"),
        ),
        `${center.id} needs sub-items`,
      );
    }
    for (const entry of [...leftNodes, ...rightNodes]) {
      assert.equal(edges.filter((edge) => edge.target === entry.id).length, 1);
    }
    assert.ok(
      edges.some(
        (edge) => edge.source === "choice" && edge.target === "option",
      ),
    );
    assert.ok(nodes.find((node) => node.id === "option").data.locked);
    assert.equal(
      edges.filter((edge) => edge.id.startsWith("spine-")).length,
      centerCount - 1,
    );
    if (centerCount <= 2) {
      assert.ok(
        leftNodes.every(
          (entry) =>
            edges.find((edge) => edge.target === entry.id).source ===
            centers[0].id,
        ),
      );
      assert.ok(
        rightNodes.every(
          (entry) =>
            edges.find((edge) => edge.target === entry.id).source ===
            centers.at(-1).id,
        ),
      );
    }
  });
}
