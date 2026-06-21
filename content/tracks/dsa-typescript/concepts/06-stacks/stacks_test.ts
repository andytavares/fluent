import { isValidParentheses, dailyTemperatures, largestRectangleInHistogram } from "./stub";

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

// --- isValidParentheses ---

test("isValidParentheses: simple parens", () => {
  assertEqual(isValidParentheses("()"), true);
});

test("isValidParentheses: all three types", () => {
  assertEqual(isValidParentheses("()[]{}"), true);
});

test("isValidParentheses: nested valid", () => {
  assertEqual(isValidParentheses("{[]}"), true);
});

test("isValidParentheses: mismatched type", () => {
  assertEqual(isValidParentheses("(]"), false);
});

test("isValidParentheses: interleaved invalid", () => {
  assertEqual(isValidParentheses("([)]"), false);
});

test("isValidParentheses: unclosed bracket", () => {
  assertEqual(isValidParentheses("("), false);
});

test("isValidParentheses: close with empty stack", () => {
  assertEqual(isValidParentheses(")"), false);
});

test("isValidParentheses: empty string", () => {
  assertEqual(isValidParentheses(""), true);
});

// --- dailyTemperatures ---

test("dailyTemperatures: standard case", () => {
  assertEqual(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]), [1, 1, 4, 2, 1, 1, 0, 0]);
});

test("dailyTemperatures: all decreasing", () => {
  assertEqual(dailyTemperatures([5, 4, 3, 2, 1]), [0, 0, 0, 0, 0]);
});

test("dailyTemperatures: all increasing", () => {
  assertEqual(dailyTemperatures([1, 2, 3, 4, 5]), [1, 1, 1, 1, 0]);
});

test("dailyTemperatures: single element", () => {
  assertEqual(dailyTemperatures([50]), [0]);
});

test("dailyTemperatures: two elements warmer", () => {
  assertEqual(dailyTemperatures([30, 60]), [1, 0]);
});

test("dailyTemperatures: two elements cooler", () => {
  assertEqual(dailyTemperatures([60, 30]), [0, 0]);
});

// --- largestRectangleInHistogram ---

test("largestRectangleInHistogram: standard case", () => {
  assertEqual(largestRectangleInHistogram([2, 1, 5, 6, 2, 3]), 10);
});

test("largestRectangleInHistogram: two bars", () => {
  assertEqual(largestRectangleInHistogram([2, 4]), 4);
});

test("largestRectangleInHistogram: single bar", () => {
  assertEqual(largestRectangleInHistogram([5]), 5);
});

test("largestRectangleInHistogram: uniform height", () => {
  assertEqual(largestRectangleInHistogram([3, 3, 3, 3]), 12);
});

test("largestRectangleInHistogram: pyramid shape", () => {
  assertEqual(largestRectangleInHistogram([1, 2, 3, 2, 1]), 6);
});

test("largestRectangleInHistogram: all ones", () => {
  assertEqual(largestRectangleInHistogram([1, 1, 1, 1, 1]), 5);
});

test("largestRectangleInHistogram: descending", () => {
  assertEqual(largestRectangleInHistogram([5, 4, 3, 2, 1]), 9);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
