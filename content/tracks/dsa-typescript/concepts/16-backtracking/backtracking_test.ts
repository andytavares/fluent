import { subsets, permutations, combinationSum } from "./stub";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  FAIL: ${name} — ${msg}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function sortedSubsets(arr: number[][]): string {
  return JSON.stringify(
    arr.map((s) => [...s].sort((a, b) => a - b)).sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      return JSON.stringify(a) < JSON.stringify(b) ? -1 : 1;
    })
  );
}

// subsets tests
test("subsets: [1,2,3] has 8 subsets", () => {
  assertEqual(subsets([1, 2, 3]).length, 8);
});

test("subsets: includes empty set", () => {
  const result = subsets([1, 2, 3]);
  const hasEmpty = result.some((s) => s.length === 0);
  if (!hasEmpty) throw new Error("missing empty subset");
});

test("subsets: includes full set", () => {
  const result = subsets([1, 2, 3]);
  const hasFull = result.some((s) => s.length === 3);
  if (!hasFull) throw new Error("missing full subset");
});

test("subsets: no duplicates", () => {
  const result = subsets([1, 2, 3]);
  const strs = result.map((s) => JSON.stringify([...s].sort()));
  const unique = new Set(strs);
  assertEqual(unique.size, 8);
});

test("subsets: empty input", () => {
  assertEqual(subsets([]).length, 1); // just the empty set
});

test("subsets: single element", () => {
  assertEqual(subsets([5]).length, 2);
});

// permutations tests
test("permutations: [1,2,3] has 6 permutations", () => {
  assertEqual(permutations([1, 2, 3]).length, 6);
});

test("permutations: all have correct length", () => {
  const result = permutations([1, 2, 3]);
  const allCorrectLength = result.every((p) => p.length === 3);
  if (!allCorrectLength) throw new Error("some permutation has wrong length");
});

test("permutations: no duplicates", () => {
  const result = permutations([1, 2, 3]);
  const strs = result.map((p) => JSON.stringify(p));
  const unique = new Set(strs);
  assertEqual(unique.size, 6);
});

test("permutations: single element", () => {
  assertEqual(permutations([1]).length, 1);
});

// combinationSum tests
test("combinationSum: [2,3,6,7] target=7", () => {
  const result = combinationSum([2, 3, 6, 7], 7);
  assertEqual(sortedSubsets(result), sortedSubsets([[2, 2, 3], [7]]));
});

test("combinationSum: [2,3] target=6", () => {
  const result = combinationSum([2, 3], 6);
  assertEqual(sortedSubsets(result), sortedSubsets([[2, 2, 2], [3, 3]]));
});

test("combinationSum: no solution", () => {
  assertEqual(combinationSum([3], 5).length, 0);
});

test("combinationSum: target=0", () => {
  // No candidates needed; only the empty combination
  assertEqual(combinationSum([1, 2], 0).length, 1);
});

test("combinationSum: single candidate", () => {
  const result = combinationSum([2], 4);
  assertEqual(sortedSubsets(result), sortedSubsets([[2, 2]]));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
