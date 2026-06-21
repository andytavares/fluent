// Run: tsx stub.ts

// Returns true if s is a palindrome, ignoring non-alphanumeric characters
// and treating upper/lower case as equal.
export function isPalindrome(s: string): boolean {
  // TODO: normalize s to lowercase alphanumeric, then use two pointers from both ends
  return false;
}

// Given heights of vertical lines at each index, return the maximum water
// area formed by choosing any two lines. Area = min(h[l], h[r]) * (r - l).
export function containerWithMostWater(heights: number[]): number {
  // TODO: start with left=0, right=end; advance the pointer with the shorter height
  return 0;
}

// Return all unique triplets [a, b, c] such that a + b + c === 0.
// No duplicate triplets. Order within each triplet and across triplets does not matter.
export function threeSum(nums: number[]): number[][] {
  // TODO: sort, then for each anchor i run two pointers on nums[i+1..end]
  return [];
}

// Usage examples (uncomment to test manually):
// console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
// console.log(containerWithMostWater([1,8,6,2,5,4,8,3,7]));   // 49
// console.log(threeSum([-1,0,1,2,-1,-4]));                     // [[-1,-1,2],[-1,0,1]]
