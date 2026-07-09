const assert = require("assert");
const { pluck, groupBy, flatten } = require("./stub");

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

const users = [
  { name: "Alice", role: "admin" },
  { name: "Bob",   role: "viewer" },
  { name: "Carol", role: "admin" },
];

test("pluck: name",     () => assert.deepStrictEqual(pluck(users, "name"), ["Alice", "Bob", "Carol"]));
test("pluck: role",     () => assert.deepStrictEqual(pluck(users, "role"), ["admin", "viewer", "admin"]));
test("pluck: empty",    () => assert.deepStrictEqual(pluck([], "x"), []));
test("pluck: missing key → undefined", () => assert.deepStrictEqual(pluck([{ a: 1 }, { b: 2 }], "a"), [1, undefined]));

const grouped = groupBy(users, "role");
test("groupBy: admin count",  () => assert.strictEqual(grouped.admin.length, 2));
test("groupBy: viewer count", () => assert.strictEqual(grouped.viewer.length, 1));
test("groupBy: admin names",  () => assert.deepStrictEqual(pluck(grouped.admin, "name"), ["Alice", "Carol"]));
test("groupBy: empty",        () => assert.deepStrictEqual(groupBy([], "x"), {}));
test("groupBy: numeric values become string keys", () => {
  const g = groupBy([{ n: 1 }, { n: 2 }, { n: 1 }], "n");
  assert.deepStrictEqual(Object.keys(g).sort(), ["1", "2"]);
  assert.strictEqual(g["1"].length, 2);
  assert.strictEqual(g["2"].length, 1);
});

test("flatten: basic",   () => assert.deepStrictEqual(flatten([[1,2],[3,4]]),    [1,2,3,4]));
test("flatten: single",  () => assert.deepStrictEqual(flatten([[1,2,3]]),        [1,2,3]));
test("flatten: empty",   () => assert.deepStrictEqual(flatten([]),               []));
test("flatten: strings", () => assert.deepStrictEqual(flatten([["a","b"],["c"]]), ["a","b","c"]));
test("flatten: only one level deep",   () => assert.deepStrictEqual(flatten([[1, [2]], [3]]), [1, [2], 3]));
test("flatten: empty inner arrays",    () => assert.deepStrictEqual(flatten([[], [1], []]), [1]));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
