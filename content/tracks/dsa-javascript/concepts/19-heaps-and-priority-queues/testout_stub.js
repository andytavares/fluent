class MinHeap {
  /**
   * @param {(a: any, b: any) => number} [compare]  negative → a above b
   */
  constructor(compare = (a, b) => a - b) {
    this.items = [];
    this.compare = compare;
  }

  /** @returns {number} */
  size() {
    return this.items.length;
  }

  /** @returns {*} top element, or undefined when empty */
  peek() {
    return this.items[0];
  }

  /** @param {*} value */
  push(value) {
  }

  /** @returns {*} removed top element, or undefined when empty */
  pop() {
    return undefined;
  }
}

/**
 * @param {number[]} nums
 * @param {number} k
 * @returns {number}
 */
function findKthLargest(nums, k) {
  return 0;
}

/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @param {number} k
 * @returns {number[][]}
 */
function kSmallestPairs(nums1, nums2, k) {
  return [];
}

class MedianFinder {
  constructor() {
  }

  /**
   * @param {number} num
   * @returns {void}
   */
  addNum(num) {
  }

  /** @returns {number} */
  findMedian() {
    return 0;
  }
}

module.exports = { MinHeap, findKthLargest, kSmallestPairs, MedianFinder };
