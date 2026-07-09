// Run: node stub.js

/**
 * Returns the index of target in sorted, distinct nums, or the index where
 * it would be inserted to keep nums sorted.
 * @param {number[]} nums  sorted ascending, distinct
 * @param {number} target
 * @returns {number}
 */
function searchInsert(nums, target) {
  // TODO: lower bound — left = 0, right = nums.length, loop while left < right;
  // nums[mid] < target → left = mid + 1, else right = mid; return left
  return 0;
}

/**
 * Returns the index of any peak (strictly greater than both neighbors;
 * outside the array counts as -Infinity).
 * @param {number[]} nums  non-empty, nums[i] !== nums[i+1] for adjacent pairs
 * @returns {number}
 */
function findPeakElement(nums) {
  // TODO: while left < right, compare nums[mid] with nums[mid + 1];
  // rising slope → left = mid + 1, falling → right = mid; return left
  return 0;
}

/**
 * Returns the index of target in a rotated sorted array of distinct values,
 * or -1 if absent.
 * @param {number[]} nums
 * @param {number} target
 * @returns {number}
 */
function searchRotated(nums, target) {
  // TODO: exact-match template; nums[left] <= nums[mid] tells you which half
  // is sorted, then range-check target against that half to pick a side
  return -1;
}

/**
 * Returns [first, last] indexes of target in a sorted array with duplicates,
 * or [-1, -1] if absent.
 * @param {number[]} nums  sorted non-decreasing
 * @param {number} target
 * @returns {number[]}
 */
function searchRange(nums, target) {
  // TODO: lowerBound(target) gives first (verify it actually holds target);
  // lowerBound(target + 1) - 1 gives last
  return [-1, -1];
}

module.exports = { searchInsert, findPeakElement, searchRotated, searchRange };

function main() {
  console.log(searchInsert([1, 3, 5, 6], 5)); // 2
  console.log(searchInsert([1, 3, 5, 6], 2)); // 1
  console.log(findPeakElement([1, 2, 3, 1])); // 2
  console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0)); // 4
  console.log(JSON.stringify(searchRange([5, 7, 7, 8, 8, 10], 8))); // [3,4]
}

main();
