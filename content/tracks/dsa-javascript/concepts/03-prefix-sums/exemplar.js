// Run: node exemplar.js

/**
 * Builds a prefix sum array of length nums.length + 1.
 * @param {number[]} nums
 * @returns {number[]}
 */
function buildPrefixSum(nums) {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
  }
  return prefix;
}

/**
 * Returns the sum of nums[i..j] inclusive using a prefix sum array.
 * @param {number[]} prefix
 * @param {number} i
 * @param {number} j
 * @returns {number}
 */
function rangeSum(prefix, i, j) {
  return prefix[j + 1] - prefix[i];
}

/**
 * Returns the number of contiguous subarrays that sum to exactly k.
 * @param {number[]} nums
 * @param {number} k
 * @returns {number}
 */
function subarraySumEqualsK(nums, k) {
  const counts = new Map([[0, 1]]);
  let running = 0, result = 0;
  for (const n of nums) {
    running += n;
    result += counts.get(running - k) ?? 0;
    counts.set(running, (counts.get(running) ?? 0) + 1);
  }
  return result;
}

module.exports = { buildPrefixSum, rangeSum, subarraySumEqualsK };

function main() {
  const p = buildPrefixSum([1, 2, 3, 4]);
  console.log(p);                      // [0, 1, 3, 6, 10]
  console.log(rangeSum(p, 1, 3));      // 9
  console.log(subarraySumEqualsK([1, 1, 1], 2)); // 2
}

main();
