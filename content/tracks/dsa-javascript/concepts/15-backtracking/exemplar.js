// Run: node exemplar.js

const KEYPAD = {
  2: "abc", 3: "def", 4: "ghi", 5: "jkl",
  6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz",
};

/**
 * One choice per slot: position i picks one letter of digits[i].
 * Strings are immutable, so passing current + ch needs no undo step.
 * O(n · 4^n) time, O(n) recursion depth.
 * @param {string} digits - characters '2'–'9', possibly empty
 * @returns {string[]} any order; "" → []
 */
function letterCombinations(digits) {
  if (digits.length === 0) return [];
  const result = [];
  function bt(i, current) {
    if (i === digits.length) {
      result.push(current);
      return;
    }
    for (const ch of KEYPAD[digits[i]]) {
      bt(i + 1, current + ch);
    }
  }
  bt(0, "");
  return result;
}

/**
 * Permutations via a shared path and a used[] array: each level picks any
 * element not yet on the path. O(n · n!) time, O(n) recursion depth.
 * @param {number[]} nums - distinct integers
 * @returns {number[][]} any order
 */
function permute(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  function bt() {
    if (path.length === nums.length) {
      result.push([...path]); // snapshot — path is shared and mutated
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      bt();
      path.pop();
      used[i] = false;
    }
  }
  bt();
  return result;
}

/**
 * Start-index recursion with reuse: recursing with i (not i + 1) lets the
 * same candidate repeat, while never going below i keeps every combination
 * non-decreasing — that canonical form is what prevents duplicates.
 * Sorting enables the break-style prune. O(b^(t/m)) worst case.
 * @param {number[]} candidates - distinct positive integers
 * @param {number} target
 * @returns {number[][]} any order
 */
function combinationSum(candidates, target) {
  const sorted = [...candidates].sort((a, b) => a - b);
  const result = [];
  const path = [];
  function bt(start, remaining) {
    if (remaining === 0) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break; // sorted → every later candidate is bigger
      path.push(sorted[i]);
      bt(i, remaining - sorted[i]); // i, not i + 1: reuse allowed
      path.pop();
    }
  }
  bt(0, target);
  return result;
}

/**
 * Constraint counters: "(" is legal while open < n, ")" while close < open.
 * The guards make invalid strings unreachable, so every leaf is well-formed.
 * O(4^n / √n) time (Catalan count), O(n) recursion depth.
 * @param {number} n - 1 ≤ n ≤ 8
 * @returns {string[]} any order
 */
function generateParenthesis(n) {
  const result = [];
  function bt(current, open, close) {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }
    if (open < n) bt(current + "(", open + 1, close);
    if (close < open) bt(current + ")", open, close + 1);
  }
  bt("", 0, 0);
  return result;
}

module.exports = { letterCombinations, permute, combinationSum, generateParenthesis };

function main() {
  console.log(letterCombinations("23"));
  // ["ad","ae","af","bd","be","bf","cd","ce","cf"]

  console.log(permute([1, 2, 3]));
  // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

  console.log(combinationSum([2, 3, 6, 7], 7));
  // [[2,2,3],[7]]

  console.log(generateParenthesis(3));
  // ["((()))","(()())","(())()","()(())","()()()"]
}

main();
