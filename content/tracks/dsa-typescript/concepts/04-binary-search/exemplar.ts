// Run: tsx exemplar.ts

export function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target)   left = mid + 1;
    else                       right = mid - 1;
  }
  return -1;
}

export function searchInsertPosition(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target)   left = mid + 1;
    else                       right = mid - 1;
  }
  // When the loop ends, left > right. left is the first index where nums[left] > target,
  // which is exactly the correct insertion position.
  return left;
}

export function findMinInRotatedArray(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] > nums[right]) {
      // mid sits in the larger left portion; minimum is strictly to the right
      left = mid + 1;
    } else {
      // mid is in the smaller right portion; minimum is at mid or to its left
      // Do NOT use right = mid - 1 here — mid could be the minimum
      right = mid;
    }
  }
  return nums[left]; // left === right, the minimum element
}
