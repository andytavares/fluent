// Run: node exemplar.js

/**
 * Kadane's algorithm: endingHere is the best sum of a subarray ending
 * exactly at i — extend the previous run or start fresh, whichever is
 * larger (fresh wins exactly when the run went negative). best folds the
 * optimum over all endpoints. Seeding with nums[0] (not 0) keeps the
 * subarray non-empty on all-negative input.
 * O(n) time, O(1) space.
 * @param {number[]} nums - non-empty
 * @returns {number}
 */
function maxSubArray(nums) {
  let endingHere = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    endingHere = Math.max(nums[i], endingHere + nums[i]);
    best = Math.max(best, endingHere);
  }
  return best;
}

/**
 * Circular variant: the answer either doesn't wrap (plain Kadane) or wraps —
 * and a wrapping subarray is the complement of a contiguous middle, so its
 * best sum is total - minKadane. All four quantities come from one pass.
 * Guard: if every element is negative (maxKadane < 0), the "wrap" would be
 * the empty subarray — return the plain Kadane answer.
 * O(n) time, O(1) space.
 * @param {number[]} nums - non-empty
 * @returns {number}
 */
function maxSubarraySumCircular(nums) {
  let maxEndingHere = nums[0];
  let maxKadane = nums[0];
  let minEndingHere = nums[0];
  let minKadane = nums[0];
  let total = nums[0];
  for (let i = 1; i < nums.length; i++) {
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    maxKadane = Math.max(maxKadane, maxEndingHere);
    minEndingHere = Math.min(nums[i], minEndingHere + nums[i]);
    minKadane = Math.min(minKadane, minEndingHere);
    total += nums[i];
  }
  if (maxKadane < 0) return maxKadane; // all negative — a wrap would be empty
  return Math.max(maxKadane, total - minKadane);
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
