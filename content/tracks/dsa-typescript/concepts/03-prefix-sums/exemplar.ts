// Run: tsx exemplar.ts

export function buildPrefixSum(nums: number[]): number[] {
  if (nums.length === 0) return [];
  const prefix = new Array<number>(nums.length).fill(0);
  prefix[0] = nums[0];
  for (let i = 1; i < nums.length; i++) {
    prefix[i] = prefix[i - 1] + nums[i];
  }
  return prefix;
}

export function rangeSum(prefix: number[], i: number, j: number): number {
  // When i === 0, there is no prefix[i-1]; the range sum is just prefix[j]
  return i === 0 ? prefix[j] : prefix[j] - prefix[i - 1];
}

export function subarraySumEqualsK(nums: number[], k: number): number {
  // Seed {0: 1}: covers subarrays starting at index 0
  // (when runningSum === k, we need runningSum - k = 0 to already be in the map)
  const counts = new Map<number, number>([[0, 1]]);
  let runningSum = 0;
  let result = 0;

  for (const num of nums) {
    runningSum += num;
    result += counts.get(runningSum - k) ?? 0;
    counts.set(runningSum, (counts.get(runningSum) ?? 0) + 1);
  }
  return result;
}
