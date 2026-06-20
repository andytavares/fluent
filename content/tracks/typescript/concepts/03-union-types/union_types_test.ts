import assert from "assert";
import { ok, err, map, unwrap, type Result } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

const success: Result<number> = ok(42);
const failure: Result<number> = err("not found");

test("ok.ok is true",     () => assert.strictEqual(success.ok, true));
test("ok.value",          () => { if (success.ok) assert.strictEqual(success.value, 42); });
test("err.ok is false",   () => assert.strictEqual(failure.ok, false));
test("err.error message", () => { if (!failure.ok) assert.strictEqual(failure.error, "not found"); });

test("map on ok applies fn",    () => {
  const r = map(ok(5), (n) => n * 2);
  assert.strictEqual(r.ok, true);
  if (r.ok) assert.strictEqual(r.value, 10);
});
test("map on err passes through", () => {
  const r = map(err<number>("oops"), (n) => n * 2);
  assert.strictEqual(r.ok, false);
  if (!r.ok) assert.strictEqual(r.error, "oops");
});
test("map type transformation",  () => {
  const r = map(ok(42), (n) => String(n));
  if (r.ok) assert.strictEqual(r.value, "42");
});

test("unwrap ok returns value", () => assert.strictEqual(unwrap(ok(99)), 99));
test("unwrap err throws",       () => {
  assert.throws(() => unwrap(err("boom")), /boom/);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
