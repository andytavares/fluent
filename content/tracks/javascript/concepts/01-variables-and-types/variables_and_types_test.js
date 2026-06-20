const assert = require("assert");
const { typeLabel, strictEquals, clamp } = require("./stub");

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

test("typeLabel: string",    () => assert.strictEqual(typeLabel("hi"),        "string"));
test("typeLabel: number",    () => assert.strictEqual(typeLabel(42),          "number"));
test("typeLabel: boolean",   () => assert.strictEqual(typeLabel(true),        "boolean"));
test("typeLabel: undefined", () => assert.strictEqual(typeLabel(undefined),   "undefined"));

test("strictEquals: 1 === 1",      () => assert.strictEqual(strictEquals(1, 1),     true));
test("strictEquals: 1 === '1'",    () => assert.strictEqual(strictEquals(1, "1"),   false));
test("strictEquals: null === null", () => assert.strictEqual(strictEquals(null, null), true));
test("strictEquals: 0 === false",  () => assert.strictEqual(strictEquals(0, false), false));

test("clamp: below min",   () => assert.strictEqual(clamp(-5, 0, 10), 0));
test("clamp: above max",   () => assert.strictEqual(clamp(15, 0, 10), 10));
test("clamp: within range", () => assert.strictEqual(clamp(5,  0, 10), 5));
test("clamp: at min",      () => assert.strictEqual(clamp(0,  0, 10), 0));
test("clamp: at max",      () => assert.strictEqual(clamp(10, 0, 10), 10));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
