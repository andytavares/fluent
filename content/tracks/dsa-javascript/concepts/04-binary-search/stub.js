// Run: node stub.js

/**
 * Returns the index of target in the sorted array, or -1 if not found.
 * @param {number[]} nums
 * @param {number} target
 * @returns {number}
 */
function binarySearch(nums, target) {
  // TODO: standard binary search with left <= right; mid = left + floor((right-left)/2)
  return -1;
}

/**
 * Returns the index of target or where it would be inserted to maintain sort order.
 * @param {number[]} nums
 * @param {number} target
 * @returns {number}
 */
function searchInsertPosition(nums, target) {
  // TODO: right = nums.length (not length-1); loop while left < right; right = mid when nums[mid] >= target
  return 0;
}

/**
 * Returns the minimum element in a rotated sorted array of unique integers.
 * @param {number[]} nums
 * @returns {number}
 */
function findMinInRotatedArray(nums) {
  // TODO: compare nums[mid] to nums[right]; if nums[mid] > nums[right] min is in right half (left = mid+1)
  // else right = mid (mid might be the min)
  return 0;
}

module.exports = { binarySearch, searchInsertPosition, findMinInRotatedArray };

function main() {
  console.log(binarySearch([1, 3, 5, 7, 9], 5));             // 2
  console.log(searchInsertPosition([1, 3, 5, 6], 2));         // 1
  console.log(findMinInRotatedArray([3, 4, 5, 1, 2]));        // 1
}

main();
