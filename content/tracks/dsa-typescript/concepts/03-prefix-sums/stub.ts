// Run: tsx stub.ts

// Build and return the prefix sum array where prefix[i] = sum of nums[0..i].
export function buildPrefixSum(nums: number[]): number[] {
  // TODO: handle empty array, then iterate and accumulate
  return [];
}

// Return the sum of nums[i..j] inclusive using the precomputed prefix array.
export function rangeSum(prefix: number[], i: number, j: number): number {
  // TODO: i === 0 is a special case (no prefix[i-1] exists)
  return 0;
}

// Count contiguous subarrays whose elements sum to exactly k.
export function subarraySumEqualsK(nums: number[], k: number): number {
  // TODO: running sum + Map<prefixSum, count>; seed with {0: 1}
  return 0;
}

// Usage examples (uncomment to test manually):
// console.log(buildPrefixSum([1, 2, 3, 4]));          // [1, 3, 6, 10]
// console.log(rangeSum([1, 3, 6, 10], 1, 3));          // 9
// console.log(subarraySumEqualsK([1, 1, 1], 2));       // 2
