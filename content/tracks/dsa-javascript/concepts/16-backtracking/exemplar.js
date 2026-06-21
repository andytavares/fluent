// Run: node exemplar.js

/**
 * Returns all subsets of nums (the power set).
 * Records current at every recursive node — not just leaves.
 * O(n · 2^n) time.
 * @param {number[]} nums - distinct integers
 * @returns {number[][]}
 */
function subsets(nums) {
  const result = [];
  function bt(start, curr) {
    result.push([...curr]);
    for (let i = start; i < nums.length; i++) {
      curr.push(nums[i]);
      bt(i + 1, curr);
      curr.pop();
    }
  }
  bt(0, []);
  return result;
}

/**
 * Returns all permutations of nums.
 * Removes the chosen element from remaining at each step.
 * O(n · n!) time.
 * @param {number[]} nums - distinct integers
 * @returns {number[][]}
 */
function permutations(nums) {
  const result = [];
  function bt(remaining, curr) {
    if (!remaining.length) {
      result.push([...curr]);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      curr.push(remaining[i]);
      bt([...remaining.slice(0, i), ...remaining.slice(i + 1)], curr);
      curr.pop();
    }
  }
  bt(nums, []);
  return result;
}

/**
 * Returns all combinations that sum to target.
 * Sorts first to enable early break pruning.
 * Passes i (not i+1) to allow each candidate to be reused.
 * @param {number[]} candidates - distinct positive integers
 * @param {number} target
 * @returns {number[][]}
 */
function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];
  function bt(start, remaining, curr) {
    if (remaining === 0) {
      result.push([...curr]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break;
      curr.push(candidates[i]);
      bt(i, remaining - candidates[i], curr);
      curr.pop();
    }
  }
  bt(0, target, []);
  return result;
}

module.exports = { subsets, permutations, combinationSum };

function main() {
  console.log(subsets([1, 2, 3]).length);      // 8
  console.log(permutations([1, 2, 3]).length); // 6
  console.log(combinationSum([2, 3, 6, 7], 7)); // [[2,2,3],[7]]
}

main();
