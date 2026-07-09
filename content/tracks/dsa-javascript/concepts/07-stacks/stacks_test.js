const assert = require("assert");
const { isValid, MinStack, evalRPN } = require("./stub");

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

// ── isValid ──
test("isValid: single pair", () => {
  assert.strictEqual(isValid("()"), true);
});
test("isValid: all three types in sequence", () => {
  assert.strictEqual(isValid("()[]{}"), true);
});
test("isValid: wrong closer type", () => {
  assert.strictEqual(isValid("(]"), false);
});
test("isValid: interleaved (not nested)", () => {
  assert.strictEqual(isValid("([)]"), false);
});
test("isValid: proper nesting", () => {
  assert.strictEqual(isValid("{[]}"), true);
});
test("isValid: lone opener", () => {
  assert.strictEqual(isValid("("), false);
});
test("isValid: lone closer", () => {
  assert.strictEqual(isValid(")"), false);
});
test("isValid: empty string", () => {
  assert.strictEqual(isValid(""), true);
});
test("isValid: leftover openers", () => {
  assert.strictEqual(isValid("(()"), false);
});
test("isValid: closer arrives with empty stack mid-string", () => {
  assert.strictEqual(isValid("()]"), false);
});
test("isValid: deep nesting", () => {
  assert.strictEqual(isValid("({[({[]})]})"), true);
});

// ── MinStack ──
test("MinStack: classic push/pop/getMin sequence", () => {
  const st = new MinStack();
  st.push(-2);
  st.push(0);
  st.push(-3);
  assert.strictEqual(st.getMin(), -3);
  st.pop();
  assert.strictEqual(st.top(), 0);
  assert.strictEqual(st.getMin(), -2);
});
test("MinStack: popping the minimum restores the previous one", () => {
  const st = new MinStack();
  st.push(5);
  st.push(1);
  assert.strictEqual(st.getMin(), 1);
  st.pop();
  assert.strictEqual(st.getMin(), 5);
});
test("MinStack: duplicate minimums survive one pop", () => {
  const st = new MinStack();
  st.push(2);
  st.push(2);
  st.push(7);
  st.pop(); // remove 7
  st.pop(); // remove one 2
  assert.strictEqual(st.getMin(), 2);
  assert.strictEqual(st.top(), 2);
});
test("MinStack: single element — top and min agree", () => {
  const st = new MinStack();
  st.push(42);
  assert.strictEqual(st.top(), 42);
  assert.strictEqual(st.getMin(), 42);
});
test("MinStack: ascending pushes keep the first min", () => {
  const st = new MinStack();
  st.push(1);
  st.push(2);
  st.push(3);
  assert.strictEqual(st.getMin(), 1);
  assert.strictEqual(st.top(), 3);
});
test("MinStack: interleaved push/pop", () => {
  const st = new MinStack();
  st.push(3);
  st.push(1);
  st.pop();
  st.push(2);
  assert.strictEqual(st.getMin(), 2);
  st.push(0);
  assert.strictEqual(st.getMin(), 0);
  st.pop();
  assert.strictEqual(st.getMin(), 2);
  assert.strictEqual(st.top(), 2);
});
test("MinStack: two independent instances don't share state", () => {
  const a = new MinStack();
  const b = new MinStack();
  a.push(1);
  b.push(9);
  assert.strictEqual(a.getMin(), 1);
  assert.strictEqual(b.getMin(), 9);
});

// ── evalRPN ──
test("evalRPN: classic example", () => {
  assert.strictEqual(evalRPN(["2", "1", "+", "3", "*"]), 9);
});
test("evalRPN: division truncates", () => {
  assert.strictEqual(evalRPN(["4", "13", "5", "/", "+"]), 6);
});
test("evalRPN: single token", () => {
  assert.strictEqual(evalRPN(["18"]), 18);
});
test("evalRPN: subtraction operand order", () => {
  assert.strictEqual(evalRPN(["7", "3", "-"]), 4);
});
test("evalRPN: division operand order", () => {
  assert.strictEqual(evalRPN(["8", "2", "/"]), 4);
});
test("evalRPN: negative operand token", () => {
  assert.strictEqual(evalRPN(["-11", "5", "+"]), -6);
});
test("evalRPN: truncation toward zero on negative quotient", () => {
  assert.strictEqual(evalRPN(["-7", "3", "/"]), -2);
});
test("evalRPN: long mixed expression", () => {
  assert.strictEqual(
    evalRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]),
    22,
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
