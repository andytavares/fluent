import { UnionFind, numConnectedComponents, earliestConnectionTime } from "./stub";

let passed = 0;
let failed = 0;

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
  if (actual !== expected) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// --- UnionFind ---

test("UnionFind: initially nothing is connected", () => {
  const uf = new UnionFind(5);
  assertEqual(uf.connected(0, 1), false);
  assertEqual(uf.connected(3, 4), false);
});

test("UnionFind: self is always connected to self", () => {
  const uf = new UnionFind(3);
  assertEqual(uf.connected(0, 0), true);
  assertEqual(uf.connected(2, 2), true);
});

test("UnionFind: union makes two nodes connected", () => {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  assertEqual(uf.connected(0, 1), true);
});

test("UnionFind: union is transitive", () => {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  uf.union(1, 2);
  assertEqual(uf.connected(0, 2), true);
});

test("UnionFind: different components not connected", () => {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  uf.union(2, 3);
  assertEqual(uf.connected(0, 2), false);
  assertEqual(uf.connected(1, 3), false);
});

test("UnionFind: union same component is idempotent", () => {
  const uf = new UnionFind(3);
  assertEqual(uf.union(0, 1), true);
  assertEqual(uf.union(0, 1), false); // second union is a no-op
  assertEqual(uf.connected(0, 1), true);
});

test("UnionFind: find returns same root for all in component", () => {
  const uf = new UnionFind(4);
  uf.union(0, 1);
  uf.union(1, 2);
  uf.union(2, 3);
  assertEqual(uf.find(0), uf.find(3));
});

// --- numConnectedComponents ---

test("numConnectedComponents: no edges", () => {
  assertEqual(numConnectedComponents(5, []), 5);
});

test("numConnectedComponents: chain → 1 component", () => {
  assertEqual(numConnectedComponents(4, [[0,1],[1,2],[2,3]]), 1);
});

test("numConnectedComponents: two groups", () => {
  assertEqual(numConnectedComponents(5, [[0,1],[1,2],[3,4]]), 2);
});

test("numConnectedComponents: single node", () => {
  assertEqual(numConnectedComponents(1, []), 1);
});

test("numConnectedComponents: fully connected", () => {
  assertEqual(numConnectedComponents(3, [[0,1],[0,2],[1,2]]), 1);
});

test("numConnectedComponents: redundant edges ignored", () => {
  assertEqual(numConnectedComponents(5, [[0,1],[0,1]]), 4);
});

// --- earliestConnectionTime ---

test("earliestConnectionTime: simple chain", () => {
  // n=3: connect 0-1 at t=1, 1-2 at t=2 → all connected at t=2
  assertEqual(earliestConnectionTime(3, [[1,0,1],[2,1,2]]), 2);
});

test("earliestConnectionTime: not possible", () => {
  // n=3 but only one edge
  assertEqual(earliestConnectionTime(3, [[1,0,1]]), -1);
});

test("earliestConnectionTime: all connected at first edge", () => {
  // n=2: one edge at t=5 connects both
  assertEqual(earliestConnectionTime(2, [[5,0,1]]), 5);
});

test("earliestConnectionTime: edges out of order in input", () => {
  // Must sort by time: connect 0-1 at t=3, 1-2 at t=1
  // Sorted: t=1 (1-2), t=3 (0-1) → all connected at t=3
  assertEqual(earliestConnectionTime(3, [[3,0,1],[1,1,2]]), 3);
});

test("earliestConnectionTime: redundant edges delay answer", () => {
  // n=3: t=1 connects 0-1, t=2 redundant, t=5 connects 1-2
  assertEqual(earliestConnectionTime(3, [[1,0,1],[2,0,1],[5,1,2]]), 5);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
