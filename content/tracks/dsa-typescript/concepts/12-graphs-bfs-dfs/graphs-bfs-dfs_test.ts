import { numIslands, cloneGraph, canFinish } from "./stub";

let passed = 0, failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  FAIL: ${name} — ${msg}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T): void {
  if (actual !== expected) throw new Error(`expected ${expected}, got ${actual}`);
}

function assertDeepEqual<T>(actual: T, expected: T): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`expected ${b}, got ${a}`);
}

function assertNotEqual<T>(actual: T, expected: T, msg?: string): void {
  if (actual === expected) throw new Error(msg ?? `expected values to differ`);
}

// ── numIslands ──
test("numIslands: one large island", () => {
  const grid = [
    ["1", "1", "1", "1", "0"],
    ["1", "1", "0", "1", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "0", "0", "0"],
  ];
  assertEqual(numIslands(grid), 1);
});
test("numIslands: three separate islands", () => {
  const grid = [
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"],
  ];
  assertEqual(numIslands(grid), 3);
});
test("numIslands: single water cell", () => {
  assertEqual(numIslands([["0"]]), 0);
});
test("numIslands: single land cell", () => {
  assertEqual(numIslands([["1"]]), 1);
});
test("numIslands: all water", () => {
  const grid = [
    ["0", "0", "0"],
    ["0", "0", "0"],
    ["0", "0", "0"],
  ];
  assertEqual(numIslands(grid), 0);
});
test("numIslands: all land is one island", () => {
  const grid = [
    ["1", "1", "1"],
    ["1", "1", "1"],
    ["1", "1", "1"],
  ];
  assertEqual(numIslands(grid), 1);
});
test("numIslands: diagonal contact does not connect", () => {
  const grid = [
    ["1", "0"],
    ["0", "1"],
  ];
  assertEqual(numIslands(grid), 2);
});
test("numIslands: ring-shaped island counts once", () => {
  const grid = [
    ["1", "1", "1"],
    ["1", "0", "1"],
    ["1", "1", "1"],
  ];
  assertEqual(numIslands(grid), 1);
});
test("numIslands: snake-shaped island winds through the grid", () => {
  const grid = [
    ["1", "1", "1", "1", "1"],
    ["0", "0", "0", "0", "1"],
    ["1", "1", "1", "1", "1"],
    ["1", "0", "0", "0", "0"],
    ["1", "1", "1", "1", "1"],
  ];
  assertEqual(numIslands(grid), 1);
});

// ── cloneGraph ──
test("cloneGraph: clone deep-equals a 4-cycle", () => {
  const graph = { "1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"] };
  assertDeepEqual(cloneGraph(graph), graph);
});
test("cloneGraph: clone is a different outer object", () => {
  const graph = { "1": ["2"], "2": ["1"] };
  assertNotEqual(cloneGraph(graph), graph);
});
test("cloneGraph: every neighbor array is a fresh array", () => {
  const graph = { "1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"] };
  const clone = cloneGraph(graph);
  for (const key of Object.keys(graph)) {
    assertNotEqual(clone[key], graph[key], `clone["${key}"] shares the original array`);
  }
});
test("cloneGraph: mutating the clone leaves the original untouched", () => {
  const graph = { "1": ["2"], "2": ["1"] };
  const clone = cloneGraph(graph);
  clone["1"].push("9");
  clone["3"] = ["1"];
  assertDeepEqual(graph, { "1": ["2"], "2": ["1"] });
});
test("cloneGraph: empty graph returns a new empty object", () => {
  const graph = {};
  const clone = cloneGraph(graph);
  assertDeepEqual(clone, {});
  assertNotEqual(clone, graph);
});
test("cloneGraph: single node with no neighbors", () => {
  const graph = { "7": [] };
  const clone = cloneGraph(graph);
  assertDeepEqual(clone, { "7": [] });
  assertNotEqual(clone["7"], graph["7"]);
});

// ── canFinish ──
test("canFinish: single prerequisite is satisfiable", () => {
  assertEqual(canFinish(2, [[1, 0]]), true);
});
test("canFinish: mutual dependency is a cycle", () => {
  assertEqual(canFinish(2, [[1, 0], [0, 1]]), false);
});
test("canFinish: no prerequisites at all", () => {
  assertEqual(canFinish(3, []), true);
});
test("canFinish: self-loop is a cycle", () => {
  assertEqual(canFinish(1, [[0, 0]]), false);
});
test("canFinish: long chain is satisfiable", () => {
  assertEqual(canFinish(5, [[1, 0], [2, 1], [3, 2], [4, 3]]), true);
});
test("canFinish: cycle among a subset blocks everything", () => {
  assertEqual(canFinish(6, [[1, 0], [2, 1], [0, 2], [4, 3]]), false);
});
test("canFinish: duplicate pairs are harmless", () => {
  assertEqual(canFinish(3, [[1, 0], [1, 0], [2, 1]]), true);
});
test("canFinish: cycle closed by the last edge", () => {
  assertEqual(canFinish(4, [[1, 0], [2, 1], [3, 2], [1, 3]]), false);
});
test("canFinish: diamond dependency is acyclic", () => {
  assertEqual(canFinish(4, [[1, 0], [2, 0], [3, 1], [3, 2]]), true);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
