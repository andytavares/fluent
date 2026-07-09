const assert = require("assert");
const { letterCombinations, permute, combinationSum, generateParenthesis } = require("./stub");

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

// Result order never matters — sort before comparing.
function byLex(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
}
// Combinations: order inside each combination doesn't matter either
function sortCombos(arr) {
  return arr.map((c) => [...c].sort((a, b) => a - b)).sort(byLex);
}
// Permutations: inner order IS the answer — sort only the outer list
function sortPerms(arr) {
  return arr.map((p) => [...p]).sort(byLex);
}

// ── letterCombinations ──
test("letterCombinations: classic \"23\"", () => {
  assert.deepStrictEqual(
    [...letterCombinations("23")].sort(),
    ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"],
  );
});
test("letterCombinations: empty input returns [] (not [\"\"])", () => {
  assert.deepStrictEqual(letterCombinations(""), []);
});
test("letterCombinations: single digit", () => {
  assert.deepStrictEqual([...letterCombinations("2")].sort(), ["a", "b", "c"]);
});
test("letterCombinations: four-letter digit 7", () => {
  assert.deepStrictEqual([...letterCombinations("7")].sort(), ["p", "q", "r", "s"]);
});
test("letterCombinations: two four-letter digits \"79\" → 16 combos", () => {
  const result = [...letterCombinations("79")].sort();
  const expected = [];
  for (const a of "pqrs") for (const b of "wxyz") expected.push(a + b);
  assert.deepStrictEqual(result, expected.sort());
});
test("letterCombinations: three digits → 27 strings of length 3", () => {
  const result = letterCombinations("234");
  assert.strictEqual(result.length, 27);
  result.forEach((s) => assert.strictEqual(s.length, 3));
  assert.strictEqual(new Set(result).size, 27);
});
test("letterCombinations: \"789\" → 48 distinct combos from the right menus", () => {
  const result = letterCombinations("789");
  assert.strictEqual(result.length, 48); // 4 × 3 × 4
  assert.strictEqual(new Set(result).size, 48);
  for (const s of result) {
    assert.strictEqual(s.length, 3);
    assert.ok("pqrs".includes(s[0]), `bad first letter in ${s}`);
    assert.ok("tuv".includes(s[1]), `bad second letter in ${s}`);
    assert.ok("wxyz".includes(s[2]), `bad third letter in ${s}`);
  }
});

// ── permute ──
test("permute: classic [1,2,3]", () => {
  const expected = sortPerms([
    [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1],
  ]);
  assert.deepStrictEqual(sortPerms(permute([1, 2, 3])), expected);
});
test("permute: two elements", () => {
  assert.deepStrictEqual(sortPerms(permute([0, 1])), [[0, 1], [1, 0]]);
});
test("permute: single element", () => {
  assert.deepStrictEqual(permute([1]), [[1]]);
});
test("permute: negative values", () => {
  assert.deepStrictEqual(sortPerms(permute([-1, 5])), [[-1, 5], [5, -1]]);
});
test("permute: results are independent arrays (no shared reference)", () => {
  const result = permute([1, 2]);
  result[0].push(999);
  assert.strictEqual(result[1].length, 2);
});
test("permute: [1,2,3,4] → 24 distinct valid permutations", () => {
  const result = permute([1, 2, 3, 4]);
  assert.strictEqual(result.length, 24);
  assert.strictEqual(new Set(result.map((p) => JSON.stringify(p))).size, 24);
  for (const p of result) {
    assert.deepStrictEqual([...p].sort((a, b) => a - b), [1, 2, 3, 4]);
  }
});
test("permute: 5 elements → 120 permutations", () => {
  const result = permute([1, 2, 3, 4, 5]);
  assert.strictEqual(result.length, 120);
  assert.strictEqual(new Set(result.map((p) => JSON.stringify(p))).size, 120);
});

// ── combinationSum ──
test("combinationSum: classic [2,3,6,7] target 7", () => {
  assert.deepStrictEqual(
    sortCombos(combinationSum([2, 3, 6, 7], 7)),
    sortCombos([[2, 2, 3], [7]]),
  );
});
test("combinationSum: [2,3,5] target 8", () => {
  assert.deepStrictEqual(
    sortCombos(combinationSum([2, 3, 5], 8)),
    sortCombos([[2, 2, 2, 2], [2, 3, 3], [3, 5]]),
  );
});
test("combinationSum: no solution returns []", () => {
  assert.deepStrictEqual(combinationSum([2], 1), []);
});
test("combinationSum: candidate equal to target", () => {
  assert.deepStrictEqual(sortCombos(combinationSum([5], 5)), [[5]]);
});
test("combinationSum: deep reuse of a single candidate", () => {
  assert.deepStrictEqual(sortCombos(combinationSum([2], 8)), [[2, 2, 2, 2]]);
});
test("combinationSum: unsorted input", () => {
  assert.deepStrictEqual(
    sortCombos(combinationSum([7, 6, 3, 2], 7)),
    sortCombos([[2, 2, 3], [7]]),
  );
});
test("combinationSum: no duplicate combinations in different orders", () => {
  const result = combinationSum([2, 3], 5); // only [2,3] as a multiset
  assert.deepStrictEqual(sortCombos(result), [[2, 3]]);
});
test("combinationSum: [2,3,5] target 11 → four combinations", () => {
  assert.deepStrictEqual(
    sortCombos(combinationSum([2, 3, 5], 11)),
    sortCombos([[2, 2, 2, 2, 3], [2, 2, 2, 5], [2, 3, 3, 3], [3, 3, 5]]),
  );
});
test("combinationSum: larger target, every combination sums correctly", () => {
  const result = combinationSum([3, 5, 7], 30);
  assert.ok(result.length > 0);
  const seen = new Set();
  for (const c of result) {
    assert.strictEqual(c.reduce((s, x) => s + x, 0), 30);
    const key = JSON.stringify([...c].sort((a, b) => a - b));
    assert.ok(!seen.has(key), `duplicate combination ${key}`);
    seen.add(key);
  }
  // Partitions of 30 into parts {3,5,7}: 3a+5b+7c=30 has exactly 7 solutions
  // (a,b,c): (10,0,0) (5,3,0) (0,6,0) (6,1,1) (1,4,1) (2,2,2) (3,0,3)
  assert.strictEqual(seen.size, 7);
});

// ── generateParenthesis ──
test("generateParenthesis: n = 3", () => {
  assert.deepStrictEqual(
    [...generateParenthesis(3)].sort(),
    ["((()))", "(()())", "(())()", "()(())", "()()()"].sort(),
  );
});
test("generateParenthesis: n = 1", () => {
  assert.deepStrictEqual(generateParenthesis(1), ["()"]);
});
test("generateParenthesis: n = 2", () => {
  assert.deepStrictEqual([...generateParenthesis(2)].sort(), ["(())", "()()"]);
});
test("generateParenthesis: n = 4 → 14 distinct valid strings of length 8", () => {
  const result = generateParenthesis(4);
  assert.strictEqual(result.length, 14); // Catalan(4)
  assert.strictEqual(new Set(result).size, 14);
  for (const s of result) {
    assert.strictEqual(s.length, 8);
    let depth = 0;
    for (const ch of s) {
      depth += ch === "(" ? 1 : -1;
      assert.ok(depth >= 0, `invalid prefix in ${s}`);
    }
    assert.strictEqual(depth, 0, `unbalanced: ${s}`);
  }
});
test("generateParenthesis: n = 6 → Catalan(6) = 132 distinct valid strings", () => {
  const result = generateParenthesis(6);
  assert.strictEqual(result.length, 132);
  assert.strictEqual(new Set(result).size, 132);
  for (const s of result) {
    assert.strictEqual(s.length, 12);
    let depth = 0;
    for (const ch of s) {
      depth += ch === "(" ? 1 : -1;
      assert.ok(depth >= 0, `invalid prefix in ${s}`);
    }
    assert.strictEqual(depth, 0, `unbalanced: ${s}`);
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
