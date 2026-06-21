const assert = require("assert");
const { isValidParentheses, dailyTemperatures, largestRectangleInHistogram } = require("./stub");

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

// isValidParentheses
test("isValidParentheses: simple pair", () => {
  assert.strictEqual(isValidParentheses("()"), true);
});
test("isValidParentheses: multiple types", () => {
  assert.strictEqual(isValidParentheses("()[]{}"), true);
});
test("isValidParentheses: mismatched", () => {
  assert.strictEqual(isValidParentheses("(]"), false);
});
test("isValidParentheses: wrong nesting order", () => {
  assert.strictEqual(isValidParentheses("([)]"), false);
});
test("isValidParentheses: nested valid", () => {
  assert.strictEqual(isValidParentheses("{[]}"), true);
});
test("isValidParentheses: empty string", () => {
  assert.strictEqual(isValidParentheses(""), true);
});
test("isValidParentheses: only open brackets", () => {
  assert.strictEqual(isValidParentheses("((("), false);
});
test("isValidParentheses: only close brackets", () => {
  assert.strictEqual(isValidParentheses(")))"), false);
});

// dailyTemperatures
test("dailyTemperatures: classic", () => {
  assert.deepStrictEqual(
    dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]),
    [1, 1, 4, 2, 1, 1, 0, 0]
  );
});
test("dailyTemperatures: ascending", () => {
  assert.deepStrictEqual(dailyTemperatures([30, 40, 50, 60]), [1, 1, 1, 0]);
});
test("dailyTemperatures: descending", () => {
  assert.deepStrictEqual(dailyTemperatures([60, 50, 40, 30]), [0, 0, 0, 0]);
});
test("dailyTemperatures: single element", () => {
  assert.deepStrictEqual(dailyTemperatures([50]), [0]);
});
test("dailyTemperatures: all same temperature", () => {
  assert.deepStrictEqual(dailyTemperatures([70, 70, 70]), [0, 0, 0]);
});
test("dailyTemperatures: two elements ascending", () => {
  assert.deepStrictEqual(dailyTemperatures([50, 60]), [1, 0]);
});

// largestRectangleInHistogram
test("largestRectangleInHistogram: classic [2,1,5,6,2,3]", () => {
  assert.strictEqual(largestRectangleInHistogram([2, 1, 5, 6, 2, 3]), 10);
});
test("largestRectangleInHistogram: two bars [2,4]", () => {
  assert.strictEqual(largestRectangleInHistogram([2, 4]), 4);
});
test("largestRectangleInHistogram: single bar", () => {
  assert.strictEqual(largestRectangleInHistogram([5]), 5);
});
test("largestRectangleInHistogram: zero height bar", () => {
  assert.strictEqual(largestRectangleInHistogram([0]), 0);
});
test("largestRectangleInHistogram: all same height", () => {
  assert.strictEqual(largestRectangleInHistogram([3, 3, 3, 3]), 12);
});
test("largestRectangleInHistogram: ascending", () => {
  assert.strictEqual(largestRectangleInHistogram([1, 2, 3, 4, 5]), 9);
});
test("largestRectangleInHistogram: descending", () => {
  assert.strictEqual(largestRectangleInHistogram([5, 4, 3, 2, 1]), 9);
});
test("largestRectangleInHistogram: valley shape", () => {
  assert.strictEqual(largestRectangleInHistogram([5, 1, 5]), 5);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
