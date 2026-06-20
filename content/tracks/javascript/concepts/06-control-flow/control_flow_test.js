const assert = require("assert");
const { classify, sumArray, keyCount, firstEven } = require("./stub");

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

// classify
test("classify: negative",          () => assert.strictEqual(classify(-1),  "negative"));
test("classify: large negative",    () => assert.strictEqual(classify(-100),"negative"));
test("classify: zero",              () => assert.strictEqual(classify(0),   "zero"));
test("classify: small boundary 1",  () => assert.strictEqual(classify(1),   "small"));
test("classify: small boundary 9",  () => assert.strictEqual(classify(9),   "small"));
test("classify: large boundary 10", () => assert.strictEqual(classify(10),  "large"));
test("classify: large",             () => assert.strictEqual(classify(100), "large"));

// sumArray
test("sumArray: empty",             () => assert.strictEqual(sumArray([]),        0));
test("sumArray: single element",    () => assert.strictEqual(sumArray([7]),        7));
test("sumArray: multiple",          () => assert.strictEqual(sumArray([1,2,3,4]), 10));
test("sumArray: negatives",         () => assert.strictEqual(sumArray([-1,-2,3]),  0));

// keyCount
test("keyCount: empty object",      () => assert.strictEqual(keyCount({}),             0));
test("keyCount: two keys",          () => assert.strictEqual(keyCount({ a:1, b:2 }),   2));
test("keyCount: no prototype keys", () => {
  const o = Object.create({ inherited: true });
  o.own = 1;
  assert.strictEqual(keyCount(o), 1);
});

// firstEven
test("firstEven: empty array",      () => assert.strictEqual(firstEven([]),         null));
test("firstEven: no even",          () => assert.strictEqual(firstEven([1,3,5]),    null));
test("firstEven: first is even",    () => assert.strictEqual(firstEven([2,3,4]),       2));
test("firstEven: even in middle",   () => assert.strictEqual(firstEven([1,3,4,6]),     4));
test("firstEven: negative even",    () => assert.strictEqual(firstEven([-2,1,3]),     -2));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
