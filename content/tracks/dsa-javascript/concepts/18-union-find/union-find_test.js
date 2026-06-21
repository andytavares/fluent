const assert = require("assert");
const { UnionFind, numConnectedComponents, earliestConnectionTime } = require("./stub");

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

// ── UnionFind — initial state ──────────────────────────────────────────────

test("UnionFind: each node is its own component initially", () => {
  const uf = new UnionFind(4);
  assert.strictEqual(uf.connected(0, 0), true);
  assert.strictEqual(uf.connected(0, 1), false);
  assert.strictEqual(uf.connected(2, 3), false);
});

// ── UnionFind — union ──────────────────────────────────────────────────────

test("UnionFind: union returns true when merging separate components", () => {
  const uf = new UnionFind(3);
  assert.strictEqual(uf.union(0, 1), true);
});
test("UnionFind: union returns false when already connected", () => {
  const uf = new UnionFind(3);
  uf.union(0, 1);
  assert.strictEqual(uf.union(0, 1), false);
  assert.strictEqual(uf.union(1, 0), false);
});
test("UnionFind: connected reflects union", () => {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  uf.union(1, 2);
  assert.strictEqual(uf.connected(0, 2), true);
  assert.strictEqual(uf.connected(0, 3), false);
});
test("UnionFind: transitive connectivity", () => {
  const uf = new UnionFind(6);
  uf.union(0, 1);
  uf.union(2, 3);
  uf.union(4, 5);
  uf.union(1, 2);
  assert.strictEqual(uf.connected(0, 3), true);
  assert.strictEqual(uf.connected(0, 4), false);
  uf.union(3, 4);
  assert.strictEqual(uf.connected(0, 5), true);
});

// ── UnionFind — path compression ──────────────────────────────────────────

test("UnionFind: find is consistent after chain unions", () => {
  const uf = new UnionFind(6);
  for (let i = 0; i < 5; i++) uf.union(i, i + 1);
  const root = uf.find(0);
  for (let i = 1; i <= 5; i++) {
    assert.strictEqual(uf.find(i), root);
  }
});

// ── UnionFind — union by rank ──────────────────────────────────────────────

test("UnionFind: union by rank handles equal-rank merge", () => {
  const uf = new UnionFind(4);
  uf.union(0, 1);
  uf.union(2, 3);
  uf.union(0, 2);
  assert.strictEqual(uf.connected(1, 3), true);
});

// ── UnionFind — edge cases ─────────────────────────────────────────────────

test("UnionFind: n=1 is connected to itself", () => {
  const uf = new UnionFind(1);
  assert.strictEqual(uf.connected(0, 0), true);
  assert.strictEqual(uf.find(0), 0);
});

// ── numConnectedComponents ─────────────────────────────────────────────────

test("numConnectedComponents: disconnected graph", () => {
  assert.strictEqual(numConnectedComponents(5, [[0,1],[1,2],[3,4]]), 2);
});
test("numConnectedComponents: fully connected", () => {
  assert.strictEqual(numConnectedComponents(4, [[0,1],[2,3],[1,2]]), 1);
});
test("numConnectedComponents: no edges", () => {
  assert.strictEqual(numConnectedComponents(3, []), 3);
});
test("numConnectedComponents: single node", () => {
  assert.strictEqual(numConnectedComponents(1, []), 1);
});
test("numConnectedComponents: duplicate edge does not reduce count twice", () => {
  assert.strictEqual(numConnectedComponents(3, [[0,1],[0,1]]), 2);
});
test("numConnectedComponents: chain graph becomes 1 component", () => {
  const edges = [[0,1],[1,2],[2,3],[3,4]];
  assert.strictEqual(numConnectedComponents(5, edges), 1);
});
test("numConnectedComponents: two isolated pairs", () => {
  assert.strictEqual(numConnectedComponents(4, [[0,1],[2,3]]), 2);
});

// ── earliestConnectionTime ─────────────────────────────────────────────────

test("earliestConnectionTime: basic chain completes at last edge", () => {
  assert.strictEqual(
    earliestConnectionTime(4, [[2,0,1],[3,1,2],[5,2,3]]),
    5
  );
});
test("earliestConnectionTime: 3 nodes connects at time 2", () => {
  assert.strictEqual(
    earliestConnectionTime(3, [[1,0,1],[2,1,2]]),
    2
  );
});
test("earliestConnectionTime: returns -1 when node never joins", () => {
  // node 3 has no edges
  assert.strictEqual(
    earliestConnectionTime(4, [[1,0,1],[2,1,2]]),
    -1
  );
});
test("earliestConnectionTime: unsorted input — sorts by time", () => {
  // connections given out of time order; node 3 connects last at time 10
  assert.strictEqual(
    earliestConnectionTime(4, [[10,2,3],[1,0,1],[3,1,2]]),
    10
  );
});
test("earliestConnectionTime: 2 nodes single edge", () => {
  assert.strictEqual(
    earliestConnectionTime(2, [[7,0,1]]),
    7
  );
});
test("earliestConnectionTime: redundant edges — only first unique merge counts", () => {
  // 0-1 connected at time 1; again at time 2 (redundant); 1-2 at time 5
  assert.strictEqual(
    earliestConnectionTime(3, [[1,0,1],[2,0,1],[5,1,2]]),
    5
  );
});
test("earliestConnectionTime: empty connections returns -1 for n>1", () => {
  assert.strictEqual(earliestConnectionTime(3, []), -1);
});
test("earliestConnectionTime: single node no edges returns -1", () => {
  // n=1 has 1 component from the start; no edges to process; loop never fires
  assert.strictEqual(earliestConnectionTime(1, []), -1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
