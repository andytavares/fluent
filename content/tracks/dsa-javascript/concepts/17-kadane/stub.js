// Run: node stub.js

/**
 * Returns the largest sum of any contiguous non-empty subarray.
 * @param {number[]} nums - non-empty
 * @returns {number}
 */
function maxSubArray(nums) {
  // TODO: Kadane — endingHere = max(nums[i], endingHere + nums[i]);
  // fold into best each step. Seed BOTH with nums[0], not 0
  // (all-negative arrays!)
  return 0;
}

/**
 * Returns the largest sum of any non-empty subarray of the CIRCULAR array
 * (may wrap past the end; each element used at most once).
 * @param {number[]} nums - non-empty
 * @returns {number}
 */
function maxSubarraySumCircular(nums) {
  // TODO: one pass computing maxKadane, minKadane (same recurrence with
  // min), and total; wrap answer = total - minKadane.
  // Guard: if maxKadane < 0 (all negative) the wrap would be empty —
  // return maxKadane directly
  return 0;
}

module.exports = { maxSubArray, maxSubarraySumCircular };

function main() {
  console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
  console.log(maxSubArray([-3, -1, -2]));                    // -1

  console.log(maxSubarraySumCircular([1, -2, 3, -2])); // 3
  console.log(maxSubarraySumCircular([5, -3, 5]));     // 10
  console.log(maxSubarraySumCircular([-3, -2, -3]));   // -2
}

main();
