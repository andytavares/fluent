import assert from "assert";
import { formatEvent, toCssProperty, capitalize, toEventKey } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

// formatEvent
test("formatEvent — user:created",    () => assert.strictEqual(formatEvent("user",    "created"), "user:created"));
test("formatEvent — post:deleted",    () => assert.strictEqual(formatEvent("post",    "deleted"), "post:deleted"));
test("formatEvent — comment:updated", () => assert.strictEqual(formatEvent("comment", "updated"), "comment:updated"));

// toCssProperty
test("toCssProperty — margin-top",    () => assert.strictEqual(toCssProperty("margin",  "top"),    "margin-top"));
test("toCssProperty — padding-left",  () => assert.strictEqual(toCssProperty("padding", "left"),   "padding-left"));
test("toCssProperty — border-bottom", () => assert.strictEqual(toCssProperty("border",  "bottom"), "border-bottom"));

// capitalize
test("capitalize — lowercase word",       () => assert.strictEqual(capitalize("hello"), "Hello"));
test("capitalize — already capitalized",  () => assert.strictEqual(capitalize("World"), "World"));
test("capitalize — empty string",         () => assert.strictEqual(capitalize(""),      ""));
test("capitalize — single char",          () => assert.strictEqual(capitalize("a"),     "A"));

// toEventKey
test("toEventKey — lowercase to upper",   () => assert.strictEqual(toEventKey("hello"),      "HELLO"));
test("toEventKey — mixed case",           () => assert.strictEqual(toEventKey("helloWorld"),  "HELLOWORLD"));
test("toEventKey — empty string",         () => assert.strictEqual(toEventKey(""),            ""));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
