// Run: node stub.js

/**
 * Returns true if s is a palindrome, ignoring non-alphanumeric chars and case.
 * @param {string} s
 * @returns {boolean}
 */
function isPalindrome(s) {
  // TODO: converging two pointers; skip non-alphanumeric chars in place
  return false;
}

/**
 * Returns the maximum water area between any two lines.
 * @param {number[]} heights
 * @returns {number}
 */
function containerWithMostWater(heights) {
  // TODO: converging two pointers; always move the shorter-line pointer inward
  return 0;
}

/**
 * Returns all unique triplets that sum to zero.
 * @param {number[]} nums
 * @returns {number[][]}
 */
function threeSum(nums) {
  // TODO: sort, fix pivot i, then converging two pointers for left/right
  // skip duplicate pivots (i > 0 && nums[i] === nums[i-1]) and inner duplicates
  return [];
}

module.exports = { isPalindrome, containerWithMostWater, threeSum };

function main() {
  console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
  console.log(containerWithMostWater([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
  console.log(JSON.stringify(threeSum([-1, 0, 1, 2, -1, -4]))); // [[-1,-1,2],[-1,0,1]]
}

main();
