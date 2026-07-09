const assert = require("assert");
const { mergeIntervals, insertInterval, minArrows } = require("./stub");

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

// ── mergeIntervals ──
test("mergeIntervals: classic example", () => {
  assert.deepStrictEqual(
    mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]),
    [[1, 6], [8, 10], [15, 18]],
  );
});
test("mergeIntervals: touching intervals merge", () => {
  assert.deepStrictEqual(mergeIntervals([[1, 4], [4, 5]]), [[1, 5]]);
});
test("mergeIntervals: containment — later intervals inside the block", () => {
  assert.deepStrictEqual(mergeIntervals([[1, 10], [2, 3], [4, 5]]), [[1, 10]]);
});
test("mergeIntervals: empty input", () => {
  assert.deepStrictEqual(mergeIntervals([]), []);
});
test("mergeIntervals: single interval", () => {
  assert.deepStrictEqual(mergeIntervals([[3, 7]]), [[3, 7]]);
});
test("mergeIntervals: unsorted input gets sorted", () => {
  assert.deepStrictEqual(
    mergeIntervals([[8, 10], [1, 3], [15, 18], [2, 6]]),
    [[1, 6], [8, 10], [15, 18]],
  );
});
test("mergeIntervals: duplicate intervals collapse", () => {
  assert.deepStrictEqual(mergeIntervals([[1, 4], [1, 4]]), [[1, 4]]);
});
test("mergeIntervals: zero-width intervals", () => {
  assert.deepStrictEqual(mergeIntervals([[5, 5], [1, 1]]), [[1, 1], [5, 5]]);
});
test("mergeIntervals: negative coordinates", () => {
  assert.deepStrictEqual(
    mergeIntervals([[-10, -5], [-6, 0], [2, 3]]),
    [[-10, 0], [2, 3]],
  );
});
test("mergeIntervals: numeric sort (two-digit starts)", () => {
  assert.deepStrictEqual(
    mergeIntervals([[10, 12], [2, 3]]),
    [[2, 3], [10, 12]],
  );
});
test("mergeIntervals: 10k touching intervals collapse to one block", () => {
  const intervals = [];
  for (let i = 9999; i >= 0; i--) intervals.push([i, i + 1]); // reverse order
  assert.deepStrictEqual(mergeIntervals(intervals), [[0, 10000]]);
});
test("mergeIntervals: 10k disjoint intervals stay disjoint", () => {
  const intervals = [];
  for (let i = 9999; i >= 0; i--) intervals.push([i * 3, i * 3 + 1]);
  const result = mergeIntervals(intervals);
  assert.strictEqual(result.length, 10000);
  assert.deepStrictEqual(result[0], [0, 1]);
  assert.deepStrictEqual(result[9999], [29997, 29998]);
});

// ── insertInterval ──
test("insertInterval: classic example", () => {
  assert.deepStrictEqual(
    insertInterval([[1, 3], [6, 9]], [2, 5]),
    [[1, 5], [6, 9]],
  );
});
test("insertInterval: swallows several intervals", () => {
  assert.deepStrictEqual(
    insertInterval([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]),
    [[1, 2], [3, 10], [12, 16]],
  );
});
test("insertInterval: empty list", () => {
  assert.deepStrictEqual(insertInterval([], [5, 7]), [[5, 7]]);
});
test("insertInterval: before everything, no overlap", () => {
  assert.deepStrictEqual(
    insertInterval([[3, 5], [8, 9]], [1, 2]),
    [[1, 2], [3, 5], [8, 9]],
  );
});
test("insertInterval: after everything, no overlap", () => {
  assert.deepStrictEqual(
    insertInterval([[1, 2], [4, 5]], [7, 9]),
    [[1, 2], [4, 5], [7, 9]],
  );
});
test("insertInterval: fully contained in an existing interval", () => {
  assert.deepStrictEqual(insertInterval([[1, 5]], [2, 3]), [[1, 5]]);
});
test("insertInterval: swallows the whole list", () => {
  assert.deepStrictEqual(
    insertInterval([[2, 3], [5, 6], [8, 9]], [1, 10]),
    [[1, 10]],
  );
});
test("insertInterval: touching at the right endpoint merges", () => {
  assert.deepStrictEqual(insertInterval([[1, 5]], [5, 7]), [[1, 7]]);
});
test("insertInterval: touching at the left endpoint merges", () => {
  assert.deepStrictEqual(insertInterval([[5, 8]], [2, 5]), [[2, 8]]);
});
test("insertInterval: fills the exact gap between neighbors", () => {
  assert.deepStrictEqual(
    insertInterval([[1, 2], [5, 6]], [3, 4]),
    [[1, 2], [3, 4], [5, 6]],
  );
});
test("insertInterval: 10k intervals, merge deep inside", () => {
  const intervals = [];
  for (let i = 0; i < 10000; i++) intervals.push([i * 10, i * 10 + 5]);
  const result = insertInterval(intervals, [50003, 50017]);
  assert.strictEqual(result.length, 9999);
  // [50000,50005] and [50010,50015] absorbed into [50000,50017]
  assert.deepStrictEqual(result[5000], [50000, 50017]);
  assert.deepStrictEqual(result[5001], [50020, 50025]);
});

// ── minArrows ──
test("minArrows: classic example", () => {
  assert.strictEqual(minArrows([[10, 16], [2, 8], [1, 6], [7, 12]]), 2);
});
test("minArrows: disjoint balloons need one arrow each", () => {
  assert.strictEqual(minArrows([[1, 2], [3, 4], [5, 6]]), 3);
});
test("minArrows: chain of touching balloons", () => {
  assert.strictEqual(minArrows([[1, 2], [2, 3], [3, 4], [4, 5]]), 2);
});
test("minArrows: empty array", () => {
  assert.strictEqual(minArrows([]), 0);
});
test("minArrows: single balloon", () => {
  assert.strictEqual(minArrows([[3, 9]]), 1);
});
test("minArrows: all balloons share a common point", () => {
  assert.strictEqual(minArrows([[1, 10], [5, 12], [9, 20], [10, 11]]), 1);
});
test("minArrows: nested balloons", () => {
  assert.strictEqual(minArrows([[1, 100], [40, 60], [50, 55]]), 1);
});
test("minArrows: negative coordinates", () => {
  assert.strictEqual(minArrows([[-10, -4], [-6, 0], [2, 3]]), 2);
});
test("minArrows: numeric sort on ends (two-digit ends)", () => {
  assert.strictEqual(minArrows([[3, 10], [1, 2]]), 2);
});
test("minArrows: large coordinates near 2^31", () => {
  assert.strictEqual(minArrows([[-2147483648, 2147483647], [0, 1]]), 1);
});
test("minArrows: 10k pairwise-overlapping chains", () => {
  // 5000 balloons around x=100 and 5000 around x=90000 → 2 arrows
  const points = [];
  for (let i = 0; i < 5000; i++) points.push([100 - i, 100 + i]);
  for (let i = 0; i < 5000; i++) points.push([90000 - i, 90000 + i]);
  assert.strictEqual(minArrows(points), 2);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
