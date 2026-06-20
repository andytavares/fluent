import assert from "assert";
import MathUtils, { clamp, lerp, VERSION, createLogger } from "./stub.js";

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

// clamp
test("clamp: below min → min",  () => assert.strictEqual(clamp(-5, 0, 10), 0));
test("clamp: above max → max",  () => assert.strictEqual(clamp(15, 0, 10), 10));
test("clamp: in range",          () => assert.strictEqual(clamp(5, 0, 10),  5));
test("clamp: equal to min",      () => assert.strictEqual(clamp(0, 0, 10),  0));
test("clamp: equal to max",      () => assert.strictEqual(clamp(10, 0, 10), 10));

// lerp
test("lerp: t=0 → a",      () => assert.strictEqual(lerp(0, 100, 0),   0));
test("lerp: t=1 → b",      () => assert.strictEqual(lerp(0, 100, 1),   100));
test("lerp: t=0.5 → mid",  () => assert.strictEqual(lerp(0, 100, 0.5), 50));
test("lerp: negative range", () => assert.strictEqual(lerp(-10, 10, 0.5), 0));

// VERSION
test("VERSION is '1.0.0'", () => assert.strictEqual(VERSION, "1.0.0"));

// createLogger
const logger = createLogger("APP");
test("log: formats correctly",   () => assert.strictEqual(logger.log("hello"),   "[APP] hello"));
test("error: formats correctly", () => assert.strictEqual(logger.error("boom"),  "[APP][ERROR] boom"));

// default export
test("default export has clamp", () => assert.strictEqual(typeof MathUtils.clamp, "function"));
test("default export has lerp",  () => assert.strictEqual(typeof MathUtils.lerp,  "function"));
test("default export VERSION",   () => assert.strictEqual(MathUtils.VERSION, "1.0.0"));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
