import assert from "assert";
import { pick, omit, mapValues, partialUpdate } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

const user = { id: 1, name: "Alice", role: "admin" };

// pick
test("pick — single key", () => {
  assert.deepStrictEqual(pick(user, ["id"]), { id: 1 });
});

test("pick — multiple keys", () => {
  assert.deepStrictEqual(pick(user, ["id", "name"]), { id: 1, name: "Alice" });
});

test("pick — omitted key absent", () => {
  const result = pick(user, ["name"]) as any;
  assert.strictEqual("role" in result, false);
});

// omit
test("omit — removes key", () => {
  assert.deepStrictEqual(omit(user, ["role"]), { id: 1, name: "Alice" });
});

test("omit — removed key absent", () => {
  const result = omit(user, ["id"]) as any;
  assert.strictEqual("id" in result, false);
});

// mapValues
test("mapValues — doubles numbers", () => {
  const nums = { a: 1, b: 2, c: 3 };
  assert.deepStrictEqual(mapValues(nums, (v) => (v as number) * 2), { a: 2, b: 4, c: 6 });
});

test("mapValues — stringify", () => {
  assert.deepStrictEqual(mapValues({ x: 10, y: 20 }, (v) => String(v)), { x: "10", y: "20" });
});

// partialUpdate
test("partialUpdate — merges patch", () => {
  assert.deepStrictEqual(partialUpdate(user, { name: "Bob" }), { id: 1, name: "Bob", role: "admin" });
});

test("partialUpdate — does not mutate original", () => {
  const orig = { id: 1, name: "Alice", role: "admin" };
  partialUpdate(orig, { name: "Bob" });
  assert.strictEqual(orig.name, "Alice");
});

test("partialUpdate — empty patch returns equivalent", () => {
  assert.deepStrictEqual(partialUpdate(user, {}), user);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
