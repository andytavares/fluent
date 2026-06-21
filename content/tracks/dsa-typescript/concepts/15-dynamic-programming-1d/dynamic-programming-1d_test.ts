import { climbingStairs, rob, coinChange } from "./stub";

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

// climbingStairs tests
test("climbingStairs: n=1", () => {
  assertEqual(climbingStairs(1), 1);
});

test("climbingStairs: n=2", () => {
  assertEqual(climbingStairs(2), 2);
});

test("climbingStairs: n=3", () => {
  assertEqual(climbingStairs(3), 3);
});

test("climbingStairs: n=5", () => {
  assertEqual(climbingStairs(5), 8);
});

test("climbingStairs: n=10", () => {
  assertEqual(climbingStairs(10), 89);
});

// rob tests
test("rob: [1,2,3,1]", () => {
  assertEqual(rob([1, 2, 3, 1]), 4);
});

test("rob: [2,7,9,3,1]", () => {
  assertEqual(rob([2, 7, 9, 3, 1]), 12);
});

test("rob: single house", () => {
  assertEqual(rob([5]), 5);
});

test("rob: two houses", () => {
  assertEqual(rob([3, 7]), 7);
});

test("rob: all equal", () => {
  assertEqual(rob([2, 2, 2, 2]), 4);
});

test("rob: empty array", () => {
  assertEqual(rob([]), 0);
});

// coinChange tests
test("coinChange: coins=[1,5,11] amount=15", () => {
  assertEqual(coinChange([1, 5, 11], 15), 3);
});

test("coinChange: coins=[1,2,5] amount=11", () => {
  assertEqual(coinChange([1, 2, 5], 11), 3);
});

test("coinChange: impossible", () => {
  assertEqual(coinChange([2], 3), -1);
});

test("coinChange: amount=0", () => {
  assertEqual(coinChange([1, 2], 0), 0);
});

test("coinChange: exact coin match", () => {
  assertEqual(coinChange([5], 5), 1);
});

test("coinChange: large amount", () => {
  assertEqual(coinChange([1, 5, 10, 25], 100), 4);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
