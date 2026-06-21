const assert = require("assert");
const { canJump, mergeIntervals, taskScheduler } = require("./stub");

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

// canJump
test("canJump: reachable", () => {
  assert.strictEqual(canJump([2, 3, 1, 1, 4]), true);
});
test("canJump: blocked by zero", () => {
  assert.strictEqual(canJump([3, 2, 1, 0, 4]), false);
});
test("canJump: single element", () => {
  assert.strictEqual(canJump([0]), true);
});
test("canJump: zero at start multi-element", () => {
  assert.strictEqual(canJump([0, 1]), false);
});
test("canJump: large jump at start", () => {
  assert.strictEqual(canJump([5, 0, 0, 0, 0, 0]), true);
});
test("canJump: gap not jumpable", () => {
  assert.strictEqual(canJump([1, 0, 1]), false);
});
test("canJump: two reachable elements", () => {
  assert.strictEqual(canJump([1, 0]), true);
});

// mergeIntervals
test("mergeIntervals: classic", () => {
  assert.deepStrictEqual(
    mergeIntervals([[1,3],[2,6],[8,10],[15,18]]),
    [[1,6],[8,10],[15,18]]
  );
});
test("mergeIntervals: touching intervals", () => {
  assert.deepStrictEqual(mergeIntervals([[1,4],[4,5]]), [[1,5]]);
});
test("mergeIntervals: containment", () => {
  assert.deepStrictEqual(mergeIntervals([[1,4],[2,3]]), [[1,4]]);
});
test("mergeIntervals: no overlaps", () => {
  assert.deepStrictEqual(mergeIntervals([[1,2],[3,4],[5,6]]), [[1,2],[3,4],[5,6]]);
});
test("mergeIntervals: single interval", () => {
  assert.deepStrictEqual(mergeIntervals([[1,5]]), [[1,5]]);
});
test("mergeIntervals: all merge into one", () => {
  assert.deepStrictEqual(mergeIntervals([[1,10],[2,5],[3,7]]), [[1,10]]);
});
test("mergeIntervals: unsorted input", () => {
  assert.deepStrictEqual(mergeIntervals([[5,10],[1,3]]), [[1,3],[5,10]]);
});

// taskScheduler
test("taskScheduler: n=2 AAABBB", () => {
  assert.strictEqual(taskScheduler(["A","A","A","B","B","B"], 2), 8);
});
test("taskScheduler: n=0 AAABBB", () => {
  assert.strictEqual(taskScheduler(["A","A","A","B","B","B"], 0), 6);
});
test("taskScheduler: many tasks fill idles", () => {
  assert.strictEqual(
    taskScheduler(["A","A","A","A","A","A","B","C","D","E","F","G"], 2), 16
  );
});
test("taskScheduler: single task type n=2", () => {
  assert.strictEqual(taskScheduler(["A","A","A"], 2), 7);
});
test("taskScheduler: two equally frequent tasks n=1", () => {
  assert.strictEqual(taskScheduler(["A","A","B","B"], 1), 4);
});
test("taskScheduler: single task n=0", () => {
  assert.strictEqual(taskScheduler(["A"], 0), 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
