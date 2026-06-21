// Run: node exemplar.js

/**
 * Returns the index of target in the sorted array, or -1 if not found.
 * O(log n) time, O(1) space.
 * @param {number[]} nums
 * @param {number} target
 * @returns {number}
 */
function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

/**
 * Returns the index of target or where it would be inserted to maintain sort order.
 * Uses the "leftmost valid position" template: right = length, loop while left < right.
 * O(log n) time, O(1) space.
 * @param {number[]} nums
 * @param {number} target
 * @returns {number}
 */
function searchInsertPosition(nums, target) {
  let left = 0, right = nums.length; // right = length: insertion can be past last element
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] < target) left = mid + 1;
    else right = mid; // mid might be the answer; don't exclude it
  }
  return left;
}

/**
 * Returns the minimum element in a rotated sorted array of unique integers.
 * Key insight: compare nums[mid] to nums[right] to determine which half contains the break.
 * O(log n) time, O(1) space.
 * @param {number[]} nums
 * @returns {number}
 */
function findMinInRotatedArray(nums) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] > nums[right]) {
      left = mid + 1; // break is in the right half; min is there
    } else {
      right = mid;    // mid could be the minimum; don't exclude it
    }
  }
  return nums[left];
}

module.exports = { binarySearch, searchInsertPosition, findMinInRotatedArray };

function main() {
  console.log(binarySearch([1, 3, 5, 7, 9], 5));              // 2
  console.log(searchInsertPosition([1, 3, 5, 6], 2));          // 1
  console.log(findMinInRotatedArray([3, 4, 5, 1, 2]));         // 1
  console.log(findMinInRotatedArray([4, 5, 6, 7, 0, 1, 2]));  // 0
}

main();
