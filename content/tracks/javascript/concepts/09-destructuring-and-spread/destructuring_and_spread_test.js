const assert = require("assert");
const { head, tail, unzip, mergeWithDefaults, sumRest, pluck } = require("./stub");

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  PASS: ${name}`); passed++; }
  catch (e) { console.log(`  FAIL: ${name} — ${e.message}`); failed++; }
}

// head
test("head: returns first element",   () => assert.strictEqual(head([10, 20, 30]), 10));
test("head: single element",          () => assert.strictEqual(head([42]), 42));
test("head: throws on empty array",   () => assert.throws(() => head([]), /empty array/));

// tail
test("tail: returns rest",            () => assert.deepStrictEqual(tail([1, 2, 3, 4]), [2, 3, 4]));
test("tail: single element → []",     () => assert.deepStrictEqual(tail([1]), []));
test("tail: empty → []",              () => assert.deepStrictEqual(tail([]), []));

// unzip
test("unzip: keys and values", () => {
  const [keys, values] = unzip([["a", 1], ["b", 2], ["c", 3]]);
  assert.deepStrictEqual(keys,   ["a", "b", "c"]);
  assert.deepStrictEqual(values, [1, 2, 3]);
});
test("unzip: empty → [[], []]", () => {
  assert.deepStrictEqual(unzip([]), [[], []]);
});

// mergeWithDefaults
test("mergeWithDefaults: override wins", () => {
  const result = mergeWithDefaults({ color: "red", size: "M" }, { color: "blue" });
  assert.deepStrictEqual(result, { color: "blue", size: "M" });
});
test("mergeWithDefaults: empty override", () => {
  const result = mergeWithDefaults({ a: 1, b: 2 }, {});
  assert.deepStrictEqual(result, { a: 1, b: 2 });
});
test("mergeWithDefaults: does not mutate defaults", () => {
  const defaults = { x: 1 };
  mergeWithDefaults(defaults, { x: 99 });
  assert.strictEqual(defaults.x, 1);
});

// sumRest
test("sumRest: multiple args", () => assert.strictEqual(sumRest(1, 2, 3, 4), 10));
test("sumRest: single arg",    () => assert.strictEqual(sumRest(7), 7));
test("sumRest: no args → 0",   () => assert.strictEqual(sumRest(), 0));

// pluck
test("pluck: extracts key", () => {
  const people = [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }];
  assert.deepStrictEqual(pluck(people, "name"), ["Alice", "Bob"]);
});
test("pluck: empty array", () => {
  assert.deepStrictEqual(pluck([], "name"), []);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
