const assert = require("assert");
const { subsets, permutations, combinationSum } = require("./stub");

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name} — ${e.message}`);
    failed++;
  }
}

function sortSubset(s) { return [...s].sort((a, b) => a - b); }
function sortSubsets(arr) {
  return arr.map(sortSubset).sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    return a.join(",") < b.join(",") ? -1 : 1;
  });
}

// subsets
test("subsets: [1,2,3] produces 8 subsets", () => {
  assert.strictEqual(subsets([1, 2, 3]).length, 8);
});
test("subsets: [1,2,3] contains empty set", () => {
  const result = subsets([1, 2, 3]);
  assert.ok(result.some(s => s.length === 0), "missing empty set");
});
test("subsets: [1,2,3] contains full set", () => {
  const result = subsets([1, 2, 3]);
  assert.ok(result.some(s => sortSubset(s).join(",") === "1,2,3"), "missing full set");
});
test("subsets: single element produces [[], [n]]", () => {
  const result = sortSubsets(subsets([5]));
  assert.deepStrictEqual(result, [[], [5]]);
});
test("subsets: empty input produces [[]]", () => {
  const result = subsets([]);
  assert.deepStrictEqual(result, [[]]);
});
test("subsets: [1,2] produces 4 subsets", () => {
  const result = sortSubsets(subsets([1, 2]));
  assert.deepStrictEqual(result, [[], [1], [2], [1, 2]]);
});
test("subsets: no duplicate subsets", () => {
  const result = subsets([1, 2, 3]);
  const seen = new Set(result.map(s => sortSubset(s).join(",")));
  assert.strictEqual(seen.size, result.length);
});

// permutations
test("permutations: [1,2,3] produces 6 permutations", () => {
  assert.strictEqual(permutations([1, 2, 3]).length, 6);
});
test("permutations: each permutation has length n", () => {
  const result = permutations([1, 2, 3]);
  assert.ok(result.every(p => p.length === 3));
});
test("permutations: single element produces [[n]]", () => {
  assert.deepStrictEqual(permutations([7]), [[7]]);
});
test("permutations: [1,2] produces both orderings", () => {
  const result = permutations([1, 2]).sort((a, b) => a[0] - b[0]);
  assert.deepStrictEqual(result, [[1, 2], [2, 1]]);
});
test("permutations: no duplicate permutations", () => {
  const result = permutations([1, 2, 3]);
  const seen = new Set(result.map(p => p.join(",")));
  assert.strictEqual(seen.size, 6);
});
test("permutations: [1,2,3,4] produces 24 permutations", () => {
  assert.strictEqual(permutations([1, 2, 3, 4]).length, 24);
});

// combinationSum
test("combinationSum: [2,3,6,7] target=7 → [[2,2,3],[7]]", () => {
  const result = sortSubsets(combinationSum([2, 3, 6, 7], 7));
  assert.deepStrictEqual(result, [[2, 2, 3], [7]]);
});
test("combinationSum: [2,3,5] target=8 → [[2,2,2,2],[2,3,3],[3,5]]", () => {
  const result = sortSubsets(combinationSum([2, 3, 5], 8));
  assert.deepStrictEqual(result, [[2, 2, 2, 2], [2, 3, 3], [3, 5]]);
});
test("combinationSum: impossible target returns []", () => {
  assert.deepStrictEqual(combinationSum([5, 7], 3), []);
});
test("combinationSum: target equals one candidate → [[target]]", () => {
  const result = combinationSum([3, 5], 5);
  assert.ok(result.some(r => r.length === 1 && r[0] === 5));
});
test("combinationSum: reuse allowed — single candidate", () => {
  const result = sortSubsets(combinationSum([3], 9));
  assert.deepStrictEqual(result, [[3, 3, 3]]);
});
test("combinationSum: no duplicate combinations", () => {
  const result = combinationSum([2, 3, 6, 7], 7);
  const seen = new Set(result.map(r => sortSubset(r).join(",")));
  assert.strictEqual(seen.size, result.length);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
