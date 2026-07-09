// Run: node exemplar.js

/**
 * Merges sorted nums2 into sorted nums1 in place, filling from the back so
 * writes never clobber unread nums1 values (k stays >= i).
 * O(m + n) time, O(1) space.
 * @param {number[]} nums1
 * @param {number} m  count of real elements in nums1
 * @param {number[]} nums2
 * @param {number} n  count of elements in nums2
 * @returns {void}
 */
function merge(nums1, m, nums2, n) {
  let i = m - 1;
  let j = n - 1;
  let k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k--] = nums1[i--];
    } else {
      nums1[k--] = nums2[j--];
    }
  }
  // Remaining nums1 prefix (if any) is already sorted and in place.
}

/**
 * Removes duplicates from a sorted array in place with a write pointer.
 * Duplicates are adjacent in sorted input, so comparing against the last
 * kept value is sufficient.
 * O(n) time, O(1) space.
 * @param {number[]} nums  sorted ascending
 * @returns {number} k — nums[0..k-1] holds the distinct values in order
 */
function removeDuplicates(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (write === 0 || nums[read] !== nums[write - 1]) {
      nums[write++] = nums[read];
    }
  }
  return write;
}

/**
 * Boyer–Moore voting: pair each candidate occurrence against a
 * non-candidate occurrence and cancel; the true majority (> n/2) can never
 * be fully cancelled, so it is the final candidate.
 * O(n) time, O(1) space.
 * @param {number[]} nums  non-empty, majority guaranteed
 * @returns {number}
 */
function majorityElement(nums) {
  let candidate = nums[0];
  let count = 0;
  for (const x of nums) {
    if (count === 0) {
      candidate = x;
      count = 1;
    } else if (x === candidate) {
      count++;
    } else {
      count--;
    }
  }
  return candidate;
}

/** Reverses nums[lo..hi] in place. */
function reverseRange(nums, lo, hi) {
  while (lo < hi) {
    const tmp = nums[lo];
    nums[lo++] = nums[hi];
    nums[hi--] = tmp;
  }
}

/**
 * Rotates right by k via three reversals: a right-rotation moves the last
 * k elements to the front as a block; reversing everything puts the block
 * in front backwards, then two partial reversals fix each block's order.
 * O(n) time, O(1) space.
 * @param {number[]} nums
 * @param {number} k  k >= 0, may exceed nums.length
 * @returns {void}
 */
function rotate(nums, k) {
  const n = nums.length;
  if (n === 0) return;
  k %= n;
  if (k === 0) return;
  reverseRange(nums, 0, n - 1);
  reverseRange(nums, 0, k - 1);
  reverseRange(nums, k, n - 1);
}

module.exports = { merge, removeDuplicates, majorityElement, rotate };

function main() {
  const nums1 = [1, 2, 3, 0, 0, 0];
  merge(nums1, 3, [2, 5, 6], 3);
  console.log(JSON.stringify(nums1)); // [1,2,2,3,5,6]

  const dedup = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
  const k = removeDuplicates(dedup);
  console.log(k, JSON.stringify(dedup.slice(0, k))); // 5 [0,1,2,3,4]

  console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); // 2

  const rot = [1, 2, 3, 4, 5, 6, 7];
  rotate(rot, 3);
  console.log(JSON.stringify(rot)); // [5,6,7,1,2,3,4]
}

main();
