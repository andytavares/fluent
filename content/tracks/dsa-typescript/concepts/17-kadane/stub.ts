// Run: npx tsx stub.ts

/**
 * Returns the largest sum of any contiguous non-empty subarray.
 */
function maxSubArray(nums: number[]): number {
  // TODO: Kadane — endingHere = max(nums[i], endingHere + nums[i]);
  // fold into best each step. Seed BOTH with nums[0], not 0
  // (all-negative arrays!)
  return 0;
}

/**
 * Returns the largest sum of any non-empty subarray of the CIRCULAR array
 * (may wrap past the end; each element used at most once).
 */
function maxSubarraySumCircular(nums: number[]): number {
  // TODO: one pass computing maxKadane, minKadane (same recurrence with
  // min), and total; wrap answer = total - minKadane.
  // Guard: if maxKadane < 0 (all negative) the wrap would be empty —
  // return maxKadane directly
  return 0;
}

export { maxSubArray, maxSubarraySumCircular };

function main() {
  console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
  console.log(maxSubArray([-3, -1, -2]));                    // -1

  console.log(maxSubarraySumCircular([1, -2, 3, -2])); // 3
  console.log(maxSubarraySumCircular([5, -3, 5]));     // 10
  console.log(maxSubarraySumCircular([-3, -2, -3]));   // -2
}

main();
