const assert = require("assert");
const { makeCounter, makeAdder, once } = require("./stub");

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

// makeCounter
const c1 = makeCounter();
test("counter starts at 0",     () => assert.strictEqual(c1(), 0));
test("counter increments to 1", () => assert.strictEqual(c1(), 1));
test("counter increments to 2", () => assert.strictEqual(c1(), 2));

const c2 = makeCounter(10);
test("counter with start=10",   () => assert.strictEqual(c2(), 10));
test("counter start=10, next",  () => assert.strictEqual(c2(), 11));

test("counters are independent", () => {
  assert.strictEqual(c1(), 3); // c1 continues from 3
  assert.strictEqual(c2(), 12);
});

// makeAdder
const add5 = makeAdder(5);
const add0 = makeAdder(0);
test("makeAdder(5)(3)",  () => assert.strictEqual(add5(3),  8));
test("makeAdder(5)(0)",  () => assert.strictEqual(add5(0),  5));
test("makeAdder(5)(-5)", () => assert.strictEqual(add5(-5), 0));
test("makeAdder(0)(7)",  () => assert.strictEqual(add0(7),  7));

// once
let callCount = 0;
const sideEffect = once(() => { callCount++; return 42; });

test("once: first call returns result",    () => assert.strictEqual(sideEffect(), 42));
test("once: fn called exactly once",       () => assert.strictEqual(callCount, 1));
test("once: second call returns same",     () => assert.strictEqual(sideEffect(), 42));
test("once: fn still called only once",    () => assert.strictEqual(callCount, 1));
test("once: third call same result",       () => assert.strictEqual(sideEffect(), 42));
test("once: fn still called only once",    () => assert.strictEqual(callCount, 1));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
