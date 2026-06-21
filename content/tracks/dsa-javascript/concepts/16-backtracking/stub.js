// Run: node stub.js

/**
 * Returns all subsets of nums (the power set).
 * @param {number[]} nums - distinct integers
 * @returns {number[][]}
 */
function subsets(nums) {
  // TODO: backtrack — record current path at every node (not just leaves)
  return [];
}

/**
 * Returns all permutations of nums.
 * @param {number[]} nums - distinct integers
 * @returns {number[][]}
 */
function permutations(nums) {
  // TODO: backtrack — at each step pick from the remaining unused elements
  return [];
}

/**
 * Returns all combinations that sum to target.
 * Each candidate may be used unlimited times.
 * @param {number[]} candidates - distinct positive integers
 * @param {number} target
 * @returns {number[][]}
 */
function combinationSum(candidates, target) {
  // TODO: sort candidates, backtrack with remaining budget,
  // pass i (not i+1) to allow reuse, break when candidate > remaining
  return [];
}

module.exports = { subsets, permutations, combinationSum };

function main() {
  console.log(subsets([1, 2, 3]));
  // [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]

  console.log(permutations([1, 2, 3]));
  // [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]

  console.log(combinationSum([2, 3, 6, 7], 7));
  // [[2,2,3], [7]]
}

main();
