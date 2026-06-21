import { slidingWindowMaximum, RecentCounter, rottingOranges } from "./stub";

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

// --- slidingWindowMaximum ---

test("slidingWindowMaximum: standard case k=3", () => {
  assertEqual(slidingWindowMaximum([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]);
});

test("slidingWindowMaximum: k=1 returns input", () => {
  assertEqual(slidingWindowMaximum([1, 2, 3], 1), [1, 2, 3]);
});

test("slidingWindowMaximum: k equals length", () => {
  assertEqual(slidingWindowMaximum([3, 1, 2], 3), [3]);
});

test("slidingWindowMaximum: decreasing sequence", () => {
  assertEqual(slidingWindowMaximum([5, 4, 3, 2, 1], 2), [5, 4, 3, 2]);
});

test("slidingWindowMaximum: single element", () => {
  assertEqual(slidingWindowMaximum([7], 1), [7]);
});

test("slidingWindowMaximum: all same values", () => {
  assertEqual(slidingWindowMaximum([2, 2, 2, 2], 2), [2, 2, 2]);
});

test("slidingWindowMaximum: negative values", () => {
  assertEqual(slidingWindowMaximum([-5, -3, -1, -2], 2), [-3, -1, -1]);
});

// --- RecentCounter ---

test("RecentCounter: first ping returns 1", () => {
  const rc = new RecentCounter();
  assertEqual(rc.ping(1), 1);
});

test("RecentCounter: pings within window", () => {
  const rc = new RecentCounter();
  rc.ping(1);
  rc.ping(100);
  rc.ping(3001);
  assertEqual(rc.ping(3002), 3);
});

test("RecentCounter: old pings expire", () => {
  const rc = new RecentCounter();
  rc.ping(1);
  rc.ping(2);
  assertEqual(rc.ping(3002), 2); // ping(1) is now outside [2, 3002]
});

test("RecentCounter: exact boundary included", () => {
  const rc = new RecentCounter();
  rc.ping(100);
  assertEqual(rc.ping(3100), 2); // 3100 - 3000 = 100, included
});

test("RecentCounter: just outside boundary excluded", () => {
  const rc = new RecentCounter();
  rc.ping(100);
  assertEqual(rc.ping(3101), 1); // 3101 - 3000 = 101 > 100, excluded
});

// --- rottingOranges ---

test("rottingOranges: standard case → 4", () => {
  assertEqual(rottingOranges([[2, 1, 1], [1, 1, 0], [0, 1, 1]]), 4);
});

test("rottingOranges: isolated fresh orange → -1", () => {
  assertEqual(rottingOranges([[2, 1, 1], [0, 1, 1], [1, 0, 1]]), -1);
});

test("rottingOranges: no fresh oranges → 0", () => {
  assertEqual(rottingOranges([[0, 2]]), 0);
});

test("rottingOranges: single fresh, single rotten adjacent → 1", () => {
  assertEqual(rottingOranges([[2, 1]]), 1);
});

test("rottingOranges: all fresh, no rotten → -1", () => {
  assertEqual(rottingOranges([[1, 1], [1, 1]]), -1);
});

test("rottingOranges: empty grid → 0", () => {
  assertEqual(rottingOranges([[0, 0], [0, 0]]), 0);
});

test("rottingOranges: already all rotten → 0", () => {
  assertEqual(rottingOranges([[2, 2], [2, 2]]), 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
