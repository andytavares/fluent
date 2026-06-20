import assert from "assert";
import { isString, isNumber, parseNumber, formatValue } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

test("isString: string",    () => assert.strictEqual(isString("hello"), true));
test("isString: number",    () => assert.strictEqual(isString(42),      false));
test("isString: null",      () => assert.strictEqual(isString(null),    false));
test("isString: undefined", () => assert.strictEqual(isString(undefined), false));

test("isNumber: number",    () => assert.strictEqual(isNumber(42),       true));
test("isNumber: 0",         () => assert.strictEqual(isNumber(0),        true));
test("isNumber: NaN",       () => assert.strictEqual(isNumber(NaN),      false));
test("isNumber: string",    () => assert.strictEqual(isNumber("42"),     false));
test("isNumber: null",      () => assert.strictEqual(isNumber(null),     false));

test("parseNumber: number passthrough", () => assert.strictEqual(parseNumber(42),    42));
test("parseNumber: string '99'",        () => assert.strictEqual(parseNumber("99"),  99));
test("parseNumber: string '3.14'",      () => assert.strictEqual(parseNumber("3.14"), 3.14));
test("parseNumber: throws on object",   () => assert.throws(() => parseNumber({}),   TypeError));
test("parseNumber: throws on 'abc'",    () => assert.throws(() => parseNumber("abc"), TypeError));

test("formatValue: string",    () => assert.strictEqual(formatValue("hi"),   '"hi"'));
test("formatValue: number",    () => assert.strictEqual(formatValue(42),     "42"));
test("formatValue: true",      () => assert.strictEqual(formatValue(true),   "true"));
test("formatValue: false",     () => assert.strictEqual(formatValue(false),  "false"));
test("formatValue: null",      () => assert.strictEqual(formatValue(null),   "null"));
test("formatValue: undefined", () => assert.strictEqual(formatValue(undefined), "undefined"));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
