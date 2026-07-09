import { letterCombinations, permute, combinationSum, generateParenthesis } from "./stub";

let passed = 0, failed = 0;

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

function assertDeepEqual<T>(actual: T, expected: T): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`expected ${b}, got ${a}`);
}

function assertEqual<T>(actual: T, expected: T): void {
  if (actual !== expected) throw new Error(`expected ${expected}, got ${actual}`);
}

function assertTrue(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

// Result order never matters — sort before comparing.
function byLex(a: number[] | string, b: number[] | string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return (a[i] as number) - (b[i] as number);
  return a.length - b.length;
}
// Combinations: order inside each combination doesn't matter either
function sortCombos(arr: number[][]): number[][] {
  return arr.map((c) => [...c].sort((a, b) => a - b)).sort(byLex);
}
// Permutations: inner order IS the answer — sort only the outer list
function sortPerms(arr: number[][]): number[][] {
  return arr.map((p) => [...p]).sort(byLex);
}

// ── letterCombinations ──
test('letterCombinations: classic "23"', () => {
  assertDeepEqual(
    [...letterCombinations("23")].sort(),
    ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"],
  );
});
test('letterCombinations: empty input returns [] (not [""])', () => {
  assertDeepEqual(letterCombinations(""), []);
});
test("letterCombinations: single digit", () => {
  assertDeepEqual([...letterCombinations("2")].sort(), ["a", "b", "c"]);
});
test("letterCombinations: four-letter digit 7", () => {
  assertDeepEqual([...letterCombinations("7")].sort(), ["p", "q", "r", "s"]);
});
test('letterCombinations: two four-letter digits "79" → 16 combos', () => {
  const result = [...letterCombinations("79")].sort();
  const expected: string[] = [];
  for (const a of "pqrs") for (const b of "wxyz") expected.push(a + b);
  assertDeepEqual(result, expected.sort());
});
test("letterCombinations: three digits → 27 strings of length 3", () => {
  const result = letterCombinations("234");
  assertEqual(result.length, 27);
  result.forEach((s) => assertEqual(s.length, 3));
  assertEqual(new Set(result).size, 27);
});

// ── permute ──
test("permute: classic [1,2,3]", () => {
  const expected = sortPerms([
    [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1],
  ]);
  assertDeepEqual(sortPerms(permute([1, 2, 3])), expected);
});
test("permute: two elements", () => {
  assertDeepEqual(sortPerms(permute([0, 1])), [[0, 1], [1, 0]]);
});
test("permute: single element", () => {
  assertDeepEqual(permute([1]), [[1]]);
});
test("permute: negative values", () => {
  assertDeepEqual(sortPerms(permute([-1, 5])), [[-1, 5], [5, -1]]);
});
test("permute: results are independent arrays (no shared reference)", () => {
  const result = permute([1, 2]);
  result[0].push(999);
  assertEqual(result[1].length, 2);
});

// ── combinationSum ──
test("combinationSum: classic [2,3,6,7] target 7", () => {
  assertDeepEqual(
    sortCombos(combinationSum([2, 3, 6, 7], 7)),
    sortCombos([[2, 2, 3], [7]]),
  );
});
test("combinationSum: [2,3,5] target 8", () => {
  assertDeepEqual(
    sortCombos(combinationSum([2, 3, 5], 8)),
    sortCombos([[2, 2, 2, 2], [2, 3, 3], [3, 5]]),
  );
});
test("combinationSum: no solution returns []", () => {
  assertDeepEqual(combinationSum([2], 1), []);
});
test("combinationSum: candidate equal to target", () => {
  assertDeepEqual(sortCombos(combinationSum([5], 5)), [[5]]);
});
test("combinationSum: deep reuse of a single candidate", () => {
  assertDeepEqual(sortCombos(combinationSum([2], 8)), [[2, 2, 2, 2]]);
});
test("combinationSum: unsorted input", () => {
  assertDeepEqual(
    sortCombos(combinationSum([7, 6, 3, 2], 7)),
    sortCombos([[2, 2, 3], [7]]),
  );
});
test("combinationSum: no duplicate combinations in different orders", () => {
  const result = combinationSum([2, 3], 5); // only [2,3] as a multiset
  assertDeepEqual(sortCombos(result), [[2, 3]]);
});

// ── generateParenthesis ──
test("generateParenthesis: n = 3", () => {
  assertDeepEqual(
    [...generateParenthesis(3)].sort(),
    ["((()))", "(()())", "(())()", "()(())", "()()()"].sort(),
  );
});
test("generateParenthesis: n = 1", () => {
  assertDeepEqual(generateParenthesis(1), ["()"]);
});
test("generateParenthesis: n = 2", () => {
  assertDeepEqual([...generateParenthesis(2)].sort(), ["(())", "()()"]);
});
test("generateParenthesis: n = 4 → 14 distinct valid strings of length 8", () => {
  const result = generateParenthesis(4);
  assertEqual(result.length, 14); // Catalan(4)
  assertEqual(new Set(result).size, 14);
  for (const s of result) {
    assertEqual(s.length, 8);
    let depth = 0;
    for (const ch of s) {
      depth += ch === "(" ? 1 : -1;
      assertTrue(depth >= 0, `invalid prefix in ${s}`);
    }
    assertEqual(depth, 0);
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
