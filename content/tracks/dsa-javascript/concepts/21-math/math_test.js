const assert = require("assert");
const { isPalindromeNumber, plusOne, mySqrt, myPow } = require("./stub");

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

// Helper: float comparison with relative tolerance
function assertClose(actual, expected) {
  const tol = 1e-9 * Math.max(1, Math.abs(expected));
  assert.ok(
    typeof actual === "number" && Math.abs(actual - expected) <= tol,
    `expected ~${expected}, got ${actual}`
  );
}

// ── isPalindromeNumber ──
test("isPalindromeNumber: classic palindrome", () => {
  assert.strictEqual(isPalindromeNumber(121), true);
});
test("isPalindromeNumber: negative is never a palindrome", () => {
  assert.strictEqual(isPalindromeNumber(-121), false);
});
test("isPalindromeNumber: trailing zero", () => {
  assert.strictEqual(isPalindromeNumber(10), false);
});
test("isPalindromeNumber: zero", () => {
  assert.strictEqual(isPalindromeNumber(0), true);
});
test("isPalindromeNumber: single digit", () => {
  assert.strictEqual(isPalindromeNumber(7), true);
});
test("isPalindromeNumber: even digit count", () => {
  assert.strictEqual(isPalindromeNumber(1221), true);
});
test("isPalindromeNumber: odd digit count", () => {
  assert.strictEqual(isPalindromeNumber(12321), true);
});
test("isPalindromeNumber: not a palindrome", () => {
  assert.strictEqual(isPalindromeNumber(123), false);
});
test("isPalindromeNumber: near-palindrome with inner zeros", () => {
  assert.strictEqual(isPalindromeNumber(1000021), false);
});
test("isPalindromeNumber: 10-digit palindrome", () => {
  assert.strictEqual(isPalindromeNumber(1000000001), true);
});

// ── plusOne ──
test("plusOne: no carry", () => {
  assert.deepStrictEqual(plusOne([1, 2, 3]), [1, 2, 4]);
});
test("plusOne: last digit below nine", () => {
  assert.deepStrictEqual(plusOne([4, 3, 2, 1]), [4, 3, 2, 2]);
});
test("plusOne: single nine grows", () => {
  assert.deepStrictEqual(plusOne([9]), [1, 0]);
});
test("plusOne: all nines grow by one digit", () => {
  assert.deepStrictEqual(plusOne([9, 9, 9]), [1, 0, 0, 0]);
});
test("plusOne: zero", () => {
  assert.deepStrictEqual(plusOne([0]), [1]);
});
test("plusOne: carry through trailing nines", () => {
  assert.deepStrictEqual(plusOne([8, 9, 9]), [9, 0, 0]);
});
test("plusOne: carry stops after one digit", () => {
  assert.deepStrictEqual(plusOne([1, 9]), [2, 0]);
});
test("plusOne: 20 digits — past Number.MAX_SAFE_INTEGER", () => {
  const twentyNines = new Array(20).fill(9);
  const expected = [1].concat(new Array(20).fill(0));
  assert.deepStrictEqual(plusOne(twentyNines), expected);
});

// ── mySqrt ──
test("mySqrt: perfect square", () => {
  assert.strictEqual(mySqrt(4), 2);
});
test("mySqrt: rounds down", () => {
  assert.strictEqual(mySqrt(8), 2);
});
test("mySqrt: zero", () => {
  assert.strictEqual(mySqrt(0), 0);
});
test("mySqrt: one", () => {
  assert.strictEqual(mySqrt(1), 1);
});
test("mySqrt: two", () => {
  assert.strictEqual(mySqrt(2), 1);
});
test("mySqrt: one below a perfect square", () => {
  assert.strictEqual(mySqrt(15), 3);
});
test("mySqrt: exactly a perfect square boundary", () => {
  assert.strictEqual(mySqrt(16), 4);
});
test("mySqrt: hundred", () => {
  assert.strictEqual(mySqrt(100), 10);
});
test("mySqrt: large non-square near 2^31", () => {
  assert.strictEqual(mySqrt(2147395599), 46339);
});
test("mySqrt: max 32-bit int", () => {
  assert.strictEqual(mySqrt(2147483647), 46340);
});

// ── myPow ──
test("myPow: integer base, positive exponent", () => {
  assertClose(myPow(2, 10), 1024);
});
test("myPow: another exact power", () => {
  assertClose(myPow(3, 4), 81);
});
test("myPow: float base", () => {
  assertClose(myPow(2.1, 3), 9.261);
});
test("myPow: negative exponent", () => {
  assertClose(myPow(2, -2), 0.25);
});
test("myPow: exponent zero", () => {
  assertClose(myPow(5, 0), 1);
});
test("myPow: zero to the zero is one by convention", () => {
  assertClose(myPow(0, 0), 1);
});
test("myPow: zero base, positive exponent", () => {
  assertClose(myPow(0, 5), 0);
});
test("myPow: negative base, odd exponent", () => {
  assertClose(myPow(-2, 3), -8);
});
test("myPow: negative base, even exponent", () => {
  assertClose(myPow(-2, 4), 16);
});
test("myPow: base one with a huge exponent (must be O(log n))", () => {
  assertClose(myPow(1, 2147483647), 1);
});
test("myPow: huge negative exponent underflows to zero", () => {
  assertClose(myPow(2, -2147483648), 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
