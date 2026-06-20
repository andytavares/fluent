const assert = require("assert");
const { multiply, sum, compose } = require("./stub");

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

test("multiply(3, 4)",      () => assert.strictEqual(multiply(3, 4),  12));
test("multiply(5)",         () => assert.strictEqual(multiply(5),      5));
test("multiply(0, 100)",    () => assert.strictEqual(multiply(0, 100), 0));
test("multiply(-2, 3)",     () => assert.strictEqual(multiply(-2, 3), -6));

test("sum()",               () => assert.strictEqual(sum(),          0));
test("sum(1)",              () => assert.strictEqual(sum(1),         1));
test("sum(1,2,3)",          () => assert.strictEqual(sum(1, 2, 3),   6));
test("sum(1,2,3,4,5)",      () => assert.strictEqual(sum(1,2,3,4,5), 15));
test("sum negative",        () => assert.strictEqual(sum(-1,-2,-3),  -6));

const double = (x) => x * 2;
const inc    = (x) => x + 1;
test("compose(double, inc)(3)", () => assert.strictEqual(compose(double, inc)(3), 8));
test("compose(inc, double)(3)", () => assert.strictEqual(compose(inc, double)(3), 7));
test("compose: identity",       () => assert.strictEqual(compose((x)=>x, (x)=>x)(42), 42));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
