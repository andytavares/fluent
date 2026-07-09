// Run: node stub.js

/**
 * Merges sorted nums2 into sorted nums1 in place.
 * nums1 has length m + n; its last n slots are placeholders.
 * @param {number[]} nums1
 * @param {number} m  count of real elements in nums1
 * @param {number[]} nums2
 * @param {number} n  count of elements in nums2
 * @returns {void} mutate nums1 — the return value is ignored
 */
function merge(nums1, m, nums2, n) {
  // TODO: three indexes from the back (i = m-1, j = n-1, k = m+n-1);
  // place the larger of nums1[i]/nums2[j] at k until nums2 is exhausted
}

/**
 * Removes duplicates from a sorted array in place.
 * @param {number[]} nums  sorted ascending
 * @returns {number} k — nums[0..k-1] holds the distinct values in order
 */
function removeDuplicates(nums) {
  // TODO: write pointer; keep nums[read] when write === 0
  // or nums[read] !== nums[write - 1]
  return 0;
}

/**
 * Returns the element appearing more than floor(n/2) times.
 * A majority element is guaranteed to exist.
 * @param {number[]} nums  non-empty
 * @returns {number}
 */
function majorityElement(nums) {
  // TODO: Boyer–Moore voting — adopt a candidate when count hits 0,
  // increment on match, decrement on mismatch
  return 0;
}

/**
 * Rotates the array right by k steps, in place.
 * @param {number[]} nums
 * @param {number} k  k >= 0, may exceed nums.length
 * @returns {void} mutate nums — the return value is ignored
 */
function rotate(nums, k) {
  // TODO: k %= nums.length, then three reversals:
  // whole array, first k elements, remaining n - k elements
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
