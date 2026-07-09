// Run: tsx stub.ts

/**
 * Returns true if s is a palindrome, ignoring non-alphanumeric chars and case.
 */
function isPalindrome(s: string): boolean {
  // TODO: converging pointers; skip non-alphanumeric chars in place
  // (re-check left < right inside the skip loops)
  return false;
}

/**
 * Returns the 1-based indexes [i, j] (i < j) of the two elements that sum
 * to target. numbers is sorted ascending; exactly one solution exists.
 */
function twoSumII(numbers: number[], target: number): number[] {
  // TODO: converging pointers; sum too small → left++, too big → right--
  // remember the +1 for 1-based indexes
  return [];
}

/**
 * Returns the maximum water area between any two lines.
 */
function containerWithMostWater(heights: number[]): number {
  // TODO: converging pointers; always move the shorter-line pointer inward
  return 0;
}

/**
 * Returns all unique triplets of values that sum to zero.
 */
function threeSum(nums: number[]): number[][] {
  // TODO: sort numerically, fix pivot i, then converging pointers for the pair
  // skip duplicate pivots (i > 0 && nums[i] === nums[i-1]) and inner duplicates
  return [];
}

export { isPalindrome, twoSumII, containerWithMostWater, threeSum };

function main() {
  console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
  console.log(JSON.stringify(twoSumII([2, 7, 11, 15], 9))); // [1,2]
  console.log(containerWithMostWater([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
  console.log(JSON.stringify(threeSum([-1, 0, 1, 2, -1, -4]))); // [[-1,-1,2],[-1,0,1]]
}

main();
