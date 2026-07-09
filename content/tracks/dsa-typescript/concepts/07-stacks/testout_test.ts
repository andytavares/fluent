import assert from "assert";
import { isValid, MinStack, evalRPN } from "./stub";

let passed = 0, failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name} — ${(e as Error).message}`);
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
test("isValid: 20k-deep nesting is valid", () => {
  const s = "([{".repeat(20000) + "}])".repeat(20000);
  assert.strictEqual(isValid(s), true);
});
test("isValid: long valid string with one flipped closer", () => {
  const s = "()".repeat(10000) + "[" + "()".repeat(10000) + ")";
  assert.strictEqual(isValid(s), false);
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
test("MinStack: descending pushes then full unwind", () => {
  const st = new MinStack();
  for (let v = 100; v >= 1; v--) st.push(v); // each push is a new min
  assert.strictEqual(st.getMin(), 1);
  for (let v = 1; v <= 99; v++) {
    assert.strictEqual(st.top(), v);
    assert.strictEqual(st.getMin(), v);
    st.pop();
  }
  assert.strictEqual(st.top(), 100);
  assert.strictEqual(st.getMin(), 100);
});
test("MinStack: 100k operations with getMin at every step", () => {
  // O(n) getMin scans turn this quadratic; O(1) implementations breeze through.
  const st = new MinStack();
  let seed = 7;
  const mins: number[] = [];
  for (let i = 0; i < 100000; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const v = seed % 100000;
    const currentMin = mins.length === 0 ? v : Math.min(v, mins[mins.length - 1]);
    mins.push(currentMin);
    st.push(v);
    assert.strictEqual(st.getMin(), currentMin);
  }
  for (let i = 0; i < 50000; i++) st.pop();
  assert.strictEqual(st.getMin(), mins[49999]);
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
test("evalRPN: single negative token", () => {
  assert.strictEqual(evalRPN(["-5"]), -5);
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
test("evalRPN: truncation toward zero, negative divisor", () => {
  assert.strictEqual(evalRPN(["6", "-4", "/"]), -1);
});
test("evalRPN: long mixed expression", () => {
  assert.strictEqual(
    evalRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]),
    22,
  );
});
test("evalRPN: 10k-term running sum", () => {
  const tokens = ["1"];
  for (let i = 0; i < 9999; i++) tokens.push("1", "+");
  assert.strictEqual(evalRPN(tokens), 10000);
});
test("evalRPN: deep operand stack before any operator", () => {
  // 1000 ones, then 999 subtractions. Each "-" pops the two top values:
  // the running result alternates 0, 1, 0, 1, ... — after the 999th
  // (odd-numbered) operator it is 0.
  const tokens: string[] = [];
  for (let i = 0; i < 1000; i++) tokens.push("1");
  for (let i = 0; i < 999; i++) tokens.push("-");
  assert.strictEqual(evalRPN(tokens), 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
