// Run: tsx stub.ts

const KEYPAD: Record<string, string> = {
  "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
  "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
};

/**
 * Returns every letter string spelled by the digits (phone keypad).
 * 2→abc 3→def 4→ghi 5→jkl 6→mno 7→pqrs 8→tuv 9→wxyz
 * digits: characters '2'-'9', possibly empty. Return order doesn't matter; "" → [].
 */
export function letterCombinations(digits: string): string[] {
  // TODO: guard the empty input first (return []);
  // recurse on position i, appending each letter of digits[i] —
  // strings are immutable, so no undo step is needed
  return [];
}

/** Returns all permutations of nums (distinct integers), in any order. */
export function permute(nums: number[]): number[][] {
  // TODO: shared path + used[] boolean array;
  // record [...path] when path.length === nums.length;
  // choose → recurse → pop AND unmark used[i]
  return [];
}

/**
 * Returns all unique combinations of candidates (distinct positive integers)
 * summing to target. Each candidate may be reused unlimited times.
 */
export function combinationSum(candidates: number[], target: number): number[][] {
  // TODO: sort ascending; bt(start, remaining, path);
  // break when candidates[i] > remaining;
  // recurse with i (NOT i + 1) so the same candidate can repeat
  return [];
}

/** Returns all well-formed strings of n pairs of parentheses. 1 <= n <= 8. */
export function generateParenthesis(n: number): string[] {
  // TODO: recurse with (current, open, close);
  // add "(" while open < n, add ")" while close < open;
  // record when current.length === 2 * n
  return [];
}

function main(): void {
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
