// Run: node stub.js

class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}

function listFromArray(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
  return head;
}

function listToArray(head) {
  const arr = [];
  while (head) { arr.push(head.val); head = head.next; }
  return arr;
}

/**
 * A min-heap backed by an array.
 * Optional comparator: (a, b) => number. Default compares numbers directly.
 */
class MinHeap {
  constructor(comparator = (a, b) => a - b) {
    this.heap = [];
    this.cmp = comparator;
  }

  size() { return this.heap.length; }
  peek() { return this.heap[0]; }

  push(val) {
    // TODO: append val, then sift up
    this.heap.push(val);
  }

  pop() {
    // TODO: swap root with last, pop last, sift down from root
    return undefined;
  }

  _siftUp(i) {
    // TODO: swap with parent while cmp(heap[i], heap[parent]) < 0
  }

  _siftDown(i) {
    // TODO: swap with smaller child while child < current
  }
}

/**
 * Returns an array of the k largest elements from nums. Order does not matter.
 * @param {number[]} nums
 * @param {number} k
 * @returns {number[]}
 */
function kLargestElements(nums, k) {
  // TODO: min-heap of size k; push each num; pop min when size > k
  return [];
}

/**
 * Merges k sorted linked lists. Returns the head of the merged sorted list.
 * @param {(ListNode|null)[]} lists
 * @returns {ListNode|null}
 */
function mergeKSortedLists(lists) {
  // TODO: min-heap comparing by .val; push all non-null heads
  // pop min, append to result, push node.next if it exists
  return null;
}

module.exports = { ListNode, listFromArray, listToArray, MinHeap, kLargestElements, mergeKSortedLists };

function main() {
  const h = new MinHeap();
  h.push(3); h.push(1); h.push(4);
  console.log(h.peek()); // 1
  console.log(h.pop());  // 1

  console.log(kLargestElements([3, 2, 1, 5, 6, 4], 2).sort((a, b) => a - b)); // [5, 6]

  const merged = mergeKSortedLists([
    listFromArray([1, 4, 5]),
    listFromArray([1, 3, 4]),
    listFromArray([2, 6])
  ]);
  console.log(listToArray(merged)); // [1,1,2,3,4,4,5,6]
}

main();
