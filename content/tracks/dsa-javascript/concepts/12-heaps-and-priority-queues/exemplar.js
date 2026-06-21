// Run: node exemplar.js

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
 * Min-heap backed by an array. Accepts an optional comparator (a, b) => number.
 * Default comparator sorts numbers ascending.
 */
class MinHeap {
  constructor(comparator = (a, b) => a - b) {
    this.heap = [];
    this.cmp = comparator;
  }

  size() { return this.heap.length; }
  peek() { return this.heap[0]; }

  push(val) {
    this.heap.push(val);
    this._siftUp(this.heap.length - 1);
  }

  pop() {
    if (!this.heap.length) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0);
    }
    return min;
  }

  _siftUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.cmp(this.heap[parent], this.heap[i]) <= 0) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _siftDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.cmp(this.heap[l], this.heap[smallest]) < 0) smallest = l;
      if (r < n && this.cmp(this.heap[r], this.heap[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

/**
 * Returns the k largest elements from nums.
 * Min-heap of size k: evict min when size exceeds k. What remains are the k largest.
 * O(n log k) time, O(k) space.
 * @param {number[]} nums
 * @param {number} k
 * @returns {number[]}
 */
function kLargestElements(nums, k) {
  const heap = new MinHeap();
  for (const n of nums) {
    heap.push(n);
    if (heap.size() > k) heap.pop();
  }
  return heap.heap.slice();
}

/**
 * Merges k sorted linked lists using a min-heap of list nodes.
 * Push all heads; repeatedly pop minimum, add to result, push its next.
 * O(n log k) time, O(k) space.
 * @param {ListNode[]} lists
 * @returns {ListNode|null}
 */
function mergeKSortedLists(lists) {
  const heap = new MinHeap((a, b) => a.val - b.val);
  for (const head of lists) {
    if (head) heap.push(head);
  }
  const dummy = new ListNode(0);
  let curr = dummy;
  while (heap.size()) {
    const node = heap.pop();
    curr.next = node;
    curr = curr.next;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}

module.exports = { MinHeap, kLargestElements, mergeKSortedLists, ListNode, listFromArray, listToArray };

function main() {
  const h = new MinHeap();
  h.push(3); h.push(1); h.push(4); h.push(1); h.push(5);
  console.log(h.peek()); // 1
  console.log(h.pop());  // 1
  console.log(h.peek()); // 1

  console.log(kLargestElements([3, 2, 1, 5, 6, 4], 2).sort((a, b) => a - b)); // [5, 6]

  const lists = [listFromArray([1, 4, 5]), listFromArray([1, 3, 4]), listFromArray([2, 6])];
  console.log(listToArray(mergeKSortedLists(lists))); // [1,1,2,3,4,4,5,6]
}

main();
