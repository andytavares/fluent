// Run: tsx exemplar.ts

export function isPalindrome(s: string): boolean {
  // Normalize: keep only lowercase alphanumeric characters
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let left = 0;
  let right = clean.length - 1;

  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true; // empty string is a palindrome
}

export function containerWithMostWater(heights: number[]): number {
  let left = 0;
  let right = heights.length - 1;
  let maxArea = 0;

  while (left < right) {
    // Area is limited by the shorter line
    const area = Math.min(heights[left], heights[right]) * (right - left);
    maxArea = Math.max(maxArea, area);

    // Advancing the taller pointer cannot increase the area (width shrinks,
    // height is still capped by the shorter side). Advance the shorter.
    if (heights[left] <= heights[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxArea;
}

export function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b); // O(n log n)
  const result: number[][] = [];

  for (let i = 0; i < nums.length - 2; i++) {
    // Skip duplicate anchors to avoid duplicate triplets
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        // Skip duplicate values on both sides before moving inward
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;   // need a larger left value
      } else {
        right--;  // need a smaller right value
      }
    }
  }
  return result;
}
