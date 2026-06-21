import { canJump, mergeIntervals, taskScheduler } from "./stub";

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
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`expected ${b}, got ${a}`);
}

// --- canJump ---

test("canJump: can reach", () => {
  assertEqual(canJump([2, 3, 1, 1, 4]), true);
});

test("canJump: cannot reach", () => {
  assertEqual(canJump([3, 2, 1, 0, 4]), false);
});

test("canJump: single element", () => {
  assertEqual(canJump([0]), true);
});

test("canJump: all zeros except first — blocked", () => {
  assertEqual(canJump([1, 0, 0]), false);
});

test("canJump: large first jump", () => {
  assertEqual(canJump([5, 0, 0, 0, 0, 0]), true);
});

test("canJump: jump exactly to last", () => {
  assertEqual(canJump([2, 0, 0]), true);
});

test("canJump: zero start with two elements", () => {
  assertEqual(canJump([0, 1]), false);
});

// --- mergeIntervals ---

test("mergeIntervals: standard case", () => {
  assertEqual(
    mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]),
    [[1, 6], [8, 10], [15, 18]]
  );
});

test("mergeIntervals: touching intervals merge", () => {
  assertEqual(mergeIntervals([[1, 4], [4, 5]]), [[1, 5]]);
});

test("mergeIntervals: no overlap", () => {
  assertEqual(mergeIntervals([[1, 2], [3, 4]]), [[1, 2], [3, 4]]);
});

test("mergeIntervals: fully contained", () => {
  assertEqual(mergeIntervals([[1, 10], [2, 5]]), [[1, 10]]);
});

test("mergeIntervals: single interval", () => {
  assertEqual(mergeIntervals([[3, 7]]), [[3, 7]]);
});

test("mergeIntervals: all merge into one", () => {
  assertEqual(mergeIntervals([[1, 4], [2, 5], [3, 6]]), [[1, 6]]);
});

test("mergeIntervals: unsorted input", () => {
  assertEqual(
    mergeIntervals([[8, 10], [1, 3], [2, 6], [15, 18]]),
    [[1, 6], [8, 10], [15, 18]]
  );
});

// --- taskScheduler ---

test("taskScheduler: n=2, symmetric tasks", () => {
  assertEqual(taskScheduler(["A","A","A","B","B","B"], 2), 8);
});

test("taskScheduler: n=0, no cooldown", () => {
  assertEqual(taskScheduler(["A","A","A","B","B","B"], 0), 6);
});

test("taskScheduler: single task type", () => {
  // A,idle,idle,A,idle,idle,A
  assertEqual(taskScheduler(["A","A","A"], 2), 7);
});

test("taskScheduler: many task types fill gaps", () => {
  // Enough variety that no idling needed
  assertEqual(taskScheduler(["A","A","A","B","B","C","C","D","E"], 2), 9);
});

test("taskScheduler: n=1", () => {
  assertEqual(taskScheduler(["A","A","A","B","B","B"], 1), 6);
});

test("taskScheduler: single task", () => {
  assertEqual(taskScheduler(["A"], 5), 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
