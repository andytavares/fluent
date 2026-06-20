import assert from "assert";
import { createConfig, StringUtils, MathUtils } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

// createConfig
test("createConfig — host", ()    => assert.strictEqual(createConfig("localhost", 3000, 5000).host,    "localhost"));
test("createConfig — port", ()    => assert.strictEqual(createConfig("localhost", 3000, 5000).port,    3000));
test("createConfig — timeout", () => assert.strictEqual(createConfig("localhost", 3000, 5000).timeout, 5000));

// StringUtils.truncate
test("truncate — short string unchanged",       () => assert.strictEqual(StringUtils.truncate("hi", 10),          "hi"));
test("truncate — long string gets ellipsis",    () => assert.strictEqual(StringUtils.truncate("hello world", 5),  "hello..."));
test("truncate — exactly at boundary",          () => assert.strictEqual(StringUtils.truncate("hello", 5),        "hello"));
test("truncate — empty string",                 () => assert.strictEqual(StringUtils.truncate("", 5),             ""));

// StringUtils.pad
test("pad — pads with spaces by default",       () => assert.strictEqual(StringUtils.pad("hi", 5),        "   hi"));
test("pad — exact length unchanged",            () => assert.strictEqual(StringUtils.pad("hello", 5),     "hello"));
test("pad — longer than length unchanged",      () => assert.strictEqual(StringUtils.pad("hello world", 3), "hello world"));
test("pad — custom pad character",              () => assert.strictEqual(StringUtils.pad("42", 5, "0"),   "00042"));

// MathUtils.clamp
test("clamp — below min returns min",           () => assert.strictEqual(MathUtils.clamp(-5, 0, 10), 0));
test("clamp — above max returns max",           () => assert.strictEqual(MathUtils.clamp(15, 0, 10), 10));
test("clamp — within range unchanged",          () => assert.strictEqual(MathUtils.clamp(5,  0, 10), 5));
test("clamp — equal to min",                    () => assert.strictEqual(MathUtils.clamp(0,  0, 10), 0));
test("clamp — equal to max",                    () => assert.strictEqual(MathUtils.clamp(10, 0, 10), 10));

// MathUtils.lerp
test("lerp — t=0 returns a",                   () => assert.strictEqual(MathUtils.lerp(0,   100, 0),   0));
test("lerp — t=1 returns b",                   () => assert.strictEqual(MathUtils.lerp(0,   100, 1),   100));
test("lerp — t=0.5 returns midpoint",          () => assert.strictEqual(MathUtils.lerp(0,   100, 0.5), 50));
test("lerp — negative range midpoint",         () => assert.strictEqual(MathUtils.lerp(-10, 10,  0.5), 0));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
