// Run: node stub.js
//
// Node representations:
//   binary tree node: { val, left, right }   (absent children are null)
//   linked list node: { val, next }          (last node's next is null)

/**
 * Builds a height-balanced BST from a sorted array of distinct integers.
 * @param {number[]} nums - sorted ascending
 * @returns {{val: number, left: object|null, right: object|null}|null}
 */
function sortedArrayToBST(nums) {
  // TODO: recurse on inclusive index bounds (lo, hi) — NOT on slice() copies;
  // base case lo > hi → null; mid = (lo + hi) >> 1 becomes the root,
  // left = build(lo, mid - 1), right = build(mid + 1, hi)
  return null;
}

/**
 * Sorts a linked list ascending in O(n log n), relinking existing nodes.
 * @param {{val: number, next: object|null}|null} head
 * @returns {{val: number, next: object|null}|null} new head
 */
function sortList(head) {
  // TODO: merge sort — base case 0 or 1 nodes;
  // split with slow = head, fast = head.next (fast head start!),
  // cut with slow.next = null, recurse on both halves, then merge
  // with a dummy head + tail pointer
  return null;
}

/**
 * Merges k sorted linked lists into one sorted list in O(N log k),
 * reusing the existing nodes.
 * @param {Array<{val: number, next: object|null}|null>} lists
 * @returns {{val: number, next: object|null}|null} merged head
 */
function mergeKLists(lists) {
  // TODO: pairwise rounds — while more than one list remains, merge
  // lists[i] with lists[i+1] (odd one passes through); reuse the same
  // two-list merge as sortList
  return null;
}

module.exports = { sortedArrayToBST, sortList, mergeKLists };

function fromArray(values) {
  let head = null, tail = null;
  for (const v of values) {
    const node = { val: v, next: null };
    if (head === null) head = node;
    else tail.next = node;
    tail = node;
  }
  return head;
}

function toArray(head) {
  const out = [];
  for (let n = head; n !== null; n = n.next) out.push(n.val);
  return out;
}

function main() {
  console.log(JSON.stringify(sortedArrayToBST([1, 2, 3])));
  // {"val":2,"left":{"val":1,...},"right":{"val":3,...}}

  console.log(toArray(sortList(fromArray([4, 2, 1, 3]))));
  // [1, 2, 3, 4]

  const lists = [fromArray([1, 4, 5]), fromArray([1, 3, 4]), fromArray([2, 6])];
  console.log(toArray(mergeKLists(lists)));
  // [1, 1, 2, 3, 4, 4, 5, 6]
}

main();
