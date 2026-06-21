// Run: node stub.js

/**
 * Builds a prefix sum array of length nums.length + 1.
 * prefix[0] = 0, prefix[i] = sum of nums[0..i-1].
 * @param {number[]} nums
 * @returns {number[]}
 */
function buildPrefixSum(nums) {
  // TODO: iterate nums, accumulate into prefix array of length n+1
  return [0];
}

/**
 * Returns the sum of nums[i..j] inclusive using a prefix sum array.
 * @param {number[]} prefix
 * @param {number} i
 * @param {number} j
 * @returns {number}
 */
function rangeSum(prefix, i, j) {
  // TODO: return prefix[j+1] - prefix[i]
  return 0;
}

/**
 * Returns the number of contiguous subarrays that sum to exactly k.
 * @param {number[]} nums
 * @param {number} k
 * @returns {number}
 */
function subarraySumEqualsK(nums, k) {
  // TODO: running prefix sum + hash map counting how many times each sum was seen
  return 0;
}

module.exports = { buildPrefixSum, rangeSum, subarraySumEqualsK };

function main() {
  const p = buildPrefixSum([1, 2, 3, 4]);
  console.log(p);                      // [0, 1, 3, 6, 10]
  console.log(rangeSum(p, 1, 3));      // 9
  console.log(subarraySumEqualsK([1, 1, 1], 2)); // 2
}

main();
