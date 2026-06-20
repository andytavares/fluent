import assert from "assert";
import { identity, first, zip } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

test("identity: number",  () => assert.strictEqual(identity(42),       42));
test("identity: string",  () => assert.strictEqual(identity("hello"),  "hello"));
test("identity: boolean", () => assert.strictEqual(identity(true),     true));
test("identity: object referential equality", () => {
  const obj = { x: 1 };
  assert.strictEqual(identity(obj), obj);
});

test("first: non-empty array",    () => assert.strictEqual(first([1, 2, 3]),   1));
test("first: single element",     () => assert.strictEqual(first(["a"]),       "a"));
test("first: empty array",        () => assert.strictEqual(first([]),          undefined));
test("first: string array",       () => assert.strictEqual(first(["x","y"]),   "x"));

test("zip: equal-length arrays",  () => assert.deepStrictEqual(zip([1,2,3],["a","b","c"]), [[1,"a"],[2,"b"],[3,"c"]]));
test("zip: first shorter",        () => assert.deepStrictEqual(zip([1],["a","b","c"]),     [[1,"a"]]));
test("zip: second shorter",       () => assert.deepStrictEqual(zip([1,2,3],["a"]),         [[1,"a"]]));
test("zip: empty arrays",         () => assert.deepStrictEqual(zip([], []),                []));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
