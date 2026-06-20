import assert from "assert";
import { distance, midpoint, translate, type Point } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

const origin: Point = { x: 0, y: 0 };
const p: Point = { x: 3, y: 4 };

test("distance: 3-4-5 triangle",  () => assert.strictEqual(distance(origin, p), 5));
test("distance: same point is 0", () => assert.strictEqual(distance(origin, origin), 0));
test("distance: symmetric",        () => assert.strictEqual(distance(origin, p), distance(p, origin)));

test("midpoint: x coordinate", () => assert.strictEqual(midpoint(origin, p).x, 1.5));
test("midpoint: y coordinate", () => assert.strictEqual(midpoint(origin, p).y, 2));
test("midpoint: same point",   () => {
  const m = midpoint(origin, origin);
  assert.strictEqual(m.x, 0);
  assert.strictEqual(m.y, 0);
});

test("translate: positive delta", () => {
  const r = translate({ x: 1, y: 2 }, 3, 4);
  assert.strictEqual(r.x, 4);
  assert.strictEqual(r.y, 6);
});
test("translate: negative delta", () => {
  const r = translate({ x: 5, y: 5 }, -3, -2);
  assert.strictEqual(r.x, 2);
  assert.strictEqual(r.y, 3);
});
test("translate: zero delta preserves point", () => {
  const r = translate({ x: 7, y: 9 }, 0, 0);
  assert.strictEqual(r.x, 7);
  assert.strictEqual(r.y, 9);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
