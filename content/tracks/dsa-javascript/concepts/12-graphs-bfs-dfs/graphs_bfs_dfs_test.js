const assert = require("assert");
const { numIslands, cloneGraph, canFinish } = require("./stub");

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name} — ${e.message}`);
    failed++;
  }
}

// ── numIslands ──
test("numIslands: one large island", () => {
  const grid = [
    ["1", "1", "1", "1", "0"],
    ["1", "1", "0", "1", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "0", "0", "0"],
  ];
  assert.strictEqual(numIslands(grid), 1);
});
test("numIslands: three separate islands", () => {
  const grid = [
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"],
  ];
  assert.strictEqual(numIslands(grid), 3);
});
test("numIslands: single water cell", () => {
  assert.strictEqual(numIslands([["0"]]), 0);
});
test("numIslands: single land cell", () => {
  assert.strictEqual(numIslands([["1"]]), 1);
});
test("numIslands: all water", () => {
  const grid = [
    ["0", "0", "0"],
    ["0", "0", "0"],
    ["0", "0", "0"],
  ];
  assert.strictEqual(numIslands(grid), 0);
});
test("numIslands: all land is one island", () => {
  const grid = [
    ["1", "1", "1"],
    ["1", "1", "1"],
    ["1", "1", "1"],
  ];
  assert.strictEqual(numIslands(grid), 1);
});
test("numIslands: diagonal contact does not connect", () => {
  const grid = [
    ["1", "0"],
    ["0", "1"],
  ];
  assert.strictEqual(numIslands(grid), 2);
});
test("numIslands: ring-shaped island counts once", () => {
  const grid = [
    ["1", "1", "1"],
    ["1", "0", "1"],
    ["1", "1", "1"],
  ];
  assert.strictEqual(numIslands(grid), 1);
});
test("numIslands: snake-shaped island winds through the grid", () => {
  const grid = [
    ["1", "1", "1", "1", "1"],
    ["0", "0", "0", "0", "1"],
    ["1", "1", "1", "1", "1"],
    ["1", "0", "0", "0", "0"],
    ["1", "1", "1", "1", "1"],
  ];
  assert.strictEqual(numIslands(grid), 1);
});

// ── cloneGraph ──
test("cloneGraph: clone deep-equals a 4-cycle", () => {
  const graph = { 1: ["2", "4"], 2: ["1", "3"], 3: ["2", "4"], 4: ["1", "3"] };
  assert.deepStrictEqual(cloneGraph(graph), graph);
});
test("cloneGraph: clone is a different outer object", () => {
  const graph = { 1: ["2"], 2: ["1"] };
  assert.notStrictEqual(cloneGraph(graph), graph);
});
test("cloneGraph: every neighbor array is a fresh array", () => {
  const graph = { 1: ["2", "4"], 2: ["1", "3"], 3: ["2", "4"], 4: ["1", "3"] };
  const clone = cloneGraph(graph);
  for (const key of Object.keys(graph)) {
    assert.notStrictEqual(clone[key], graph[key], `clone["${key}"] shares the original array`);
  }
});
test("cloneGraph: mutating the clone leaves the original untouched", () => {
  const graph = { 1: ["2"], 2: ["1"] };
  const clone = cloneGraph(graph);
  clone["1"].push("9");
  clone["3"] = ["1"];
  assert.deepStrictEqual(graph, { 1: ["2"], 2: ["1"] });
});
test("cloneGraph: empty graph returns a new empty object", () => {
  const graph = {};
  const clone = cloneGraph(graph);
  assert.deepStrictEqual(clone, {});
  assert.notStrictEqual(clone, graph);
});
test("cloneGraph: single node with no neighbors", () => {
  const graph = { 7: [] };
  const clone = cloneGraph(graph);
  assert.deepStrictEqual(clone, { 7: [] });
  assert.notStrictEqual(clone["7"], graph["7"]);
});

// ── canFinish ──
test("canFinish: single prerequisite is satisfiable", () => {
  assert.strictEqual(canFinish(2, [[1, 0]]), true);
});
test("canFinish: mutual dependency is a cycle", () => {
  assert.strictEqual(canFinish(2, [[1, 0], [0, 1]]), false);
});
test("canFinish: no prerequisites at all", () => {
  assert.strictEqual(canFinish(3, []), true);
});
test("canFinish: self-loop is a cycle", () => {
  assert.strictEqual(canFinish(1, [[0, 0]]), false);
});
test("canFinish: long chain is satisfiable", () => {
  assert.strictEqual(canFinish(5, [[1, 0], [2, 1], [3, 2], [4, 3]]), true);
});
test("canFinish: cycle among a subset blocks everything", () => {
  assert.strictEqual(canFinish(6, [[1, 0], [2, 1], [0, 2], [4, 3]]), false);
});
test("canFinish: duplicate pairs are harmless", () => {
  assert.strictEqual(canFinish(3, [[1, 0], [1, 0], [2, 1]]), true);
});
test("canFinish: cycle closed by the last edge", () => {
  assert.strictEqual(canFinish(4, [[1, 0], [2, 1], [3, 2], [1, 3]]), false);
});
test("canFinish: diamond dependency is acyclic", () => {
  assert.strictEqual(canFinish(4, [[1, 0], [2, 0], [3, 1], [3, 2]]), true);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
