// Run: node exemplar.js

/**
 * Returns true if s is a palindrome, ignoring non-alphanumeric chars and case.
 * O(n) time, O(1) space.
 * @param {string} s
 * @returns {boolean}
 */
function isPalindrome(s) {
  const isAlnum = (c) => /[a-zA-Z0-9]/.test(c);
  let left = 0, right = s.length - 1;
  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}

/**
 * Returns the maximum water area between any two lines.
 * Move the shorter-line pointer inward — moving the taller one can only
 * reduce width without any chance of increasing height.
 * O(n) time, O(1) space.
 * @param {number[]} heights
 * @returns {number}
 */
function containerWithMostWater(heights) {
  let left = 0, right = heights.length - 1;
  let maxArea = 0;
  while (left < right) {
    const area = Math.min(heights[left], heights[right]) * (right - left);
    maxArea = Math.max(maxArea, area);
    if (heights[left] <= heights[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxArea;
}

/**
 * Returns all unique triplets that sum to zero.
 * Sort first, then fix a pivot and use converging two-pointers for the pair.
 * Skip duplicate pivots and duplicate inner values to avoid repeat triplets.
 * O(n²) time, O(1) auxiliary space (output excluded).
 * @param {number[]} nums
 * @returns {number[][]}
 */
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    // Skip duplicate pivot values
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    // Optimization: if smallest possible sum > 0, done
    if (nums[i] > 0) break;

    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        // Skip duplicates on both inner pointers
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

module.exports = { isPalindrome, containerWithMostWater, threeSum };

function main() {
  console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
  console.log(containerWithMostWater([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
  console.log(JSON.stringify(threeSum([-1, 0, 1, 2, -1, -4]))); // [[-1,-1,2],[-1,0,1]]
}

main();
