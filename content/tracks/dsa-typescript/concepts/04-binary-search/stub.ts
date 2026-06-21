// Run: tsx stub.ts

// Return the index of target in the sorted array, or -1 if not found.
export function binarySearch(nums: number[], target: number): number {
  // TODO: inclusive bounds [left, right], halve each step
  return -1;
}

// Return the index where target should be inserted to keep nums sorted.
// If target exists, return its current index.
export function searchInsertPosition(nums: number[], target: number): number {
  // TODO: binary search; on miss, left is the insertion point
  return 0;
}

// Find and return the minimum element in a rotated sorted array (no duplicates).
export function findMinInRotatedArray(nums: number[]): number {
  // TODO: compare nums[mid] to nums[right] to determine which half has the min
  return 0;
}

// Usage examples (uncomment to test manually):
// console.log(binarySearch([1,3,5,7,9], 7));        // 3
// console.log(searchInsertPosition([1,3,5,6], 2));   // 1
// console.log(findMinInRotatedArray([3,4,5,1,2]));   // 1
