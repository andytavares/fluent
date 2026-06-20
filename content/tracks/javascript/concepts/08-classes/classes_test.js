const assert = require("assert");
const { Stack, Shape, Circle, Rectangle } = require("./stub");

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

// Stack
test("Stack: isEmpty on new stack", () => assert.strictEqual(new Stack().isEmpty, true));
test("Stack: size on new stack",    () => assert.strictEqual(new Stack().size, 0));

test("Stack: push increases size", () => {
  const s = new Stack(); s.push(1); s.push(2);
  assert.strictEqual(s.size, 2);
});

test("Stack: pop returns top", () => {
  const s = new Stack(); s.push(10); s.push(20);
  assert.strictEqual(s.pop(), 20);
});

test("Stack: pop decreases size", () => {
  const s = new Stack(); s.push(1); s.push(2); s.pop();
  assert.strictEqual(s.size, 1);
});

test("Stack: peek returns top without removing", () => {
  const s = new Stack(); s.push(42);
  assert.strictEqual(s.peek(), 42);
  assert.strictEqual(s.size, 1);
});

test("Stack: pop on empty throws", () => {
  assert.throws(() => new Stack().pop(), /Stack is empty/);
});

test("Stack: peek on empty throws", () => {
  assert.throws(() => new Stack().peek(), /Stack is empty/);
});

test("Stack: isEmpty after push and pop", () => {
  const s = new Stack(); s.push(1); s.pop();
  assert.strictEqual(s.isEmpty, true);
});

// Shape
test("Shape.describe", () => {
  assert.strictEqual(new Shape("red").describe(), "A red shape");
});

// Circle
test("Circle.describe", () => {
  assert.strictEqual(new Circle("blue", 5).describe(), "A blue circle with radius 5");
});

test("Circle instanceof Shape", () => {
  assert.ok(new Circle("red", 1) instanceof Shape);
});

test("Circle.unitCircle returns white radius-1 circle", () => {
  const u = Circle.unitCircle();
  assert.strictEqual(u.describe(), "A white circle with radius 1");
});

// Rectangle
test("Rectangle.describe", () => {
  assert.strictEqual(new Rectangle("green", 3, 4).describe(), "A green rectangle 3x4");
});

test("Rectangle.area", () => {
  assert.strictEqual(new Rectangle("red", 3, 4).area(), 12);
});

test("Rectangle instanceof Shape", () => {
  assert.ok(new Rectangle("blue", 1, 1) instanceof Shape);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
