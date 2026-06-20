import assert from "assert";
import { Shape, Circle, Rectangle, ResizableCircle } from "./stub";

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e: any) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

// Circle
test("Circle.area: pi*r^2", () => {
  assert.ok(Math.abs(new Circle(5).area() - Math.PI * 25) < 1e-9);
});

test("Circle.describe: format", () => {
  assert.strictEqual(new Circle(1).describe(), `Area: ${(Math.PI).toFixed(2)}`);
});

test("Circle instanceof Shape", () => {
  assert.ok(new Circle(1) instanceof Shape);
});

// Rectangle
test("Rectangle.area: w*h", () => {
  assert.strictEqual(new Rectangle(3, 4).area(), 12);
});

test("Rectangle.describe: format", () => {
  assert.strictEqual(new Rectangle(3, 4).describe(), "Area: 12.00");
});

test("Rectangle instanceof Shape", () => {
  assert.ok(new Rectangle(2, 3) instanceof Shape);
});

// ResizableCircle
test("ResizableCircle: initial radius", () => {
  assert.strictEqual(new ResizableCircle(5).getRadius(), 5);
});

test("ResizableCircle.scale: doubles radius", () => {
  const rc = new ResizableCircle(4);
  rc.scale(2);
  assert.strictEqual(rc.getRadius(), 8);
});

test("ResizableCircle.area after scale", () => {
  const rc = new ResizableCircle(3);
  rc.scale(2);
  assert.ok(Math.abs(rc.area() - Math.PI * 36) < 1e-9);
});

test("ResizableCircle.describe after scale", () => {
  const rc = new ResizableCircle(1);
  rc.scale(3);
  assert.strictEqual(rc.describe(), `Area: ${(Math.PI * 9).toFixed(2)}`);
});

test("ResizableCircle instanceof Shape", () => {
  assert.ok(new ResizableCircle(1) instanceof Shape);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
