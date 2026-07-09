// Run: tsx stub.ts
//
// Node representations:
//   binary tree node: { val, left, right }   (absent children are null)
//   linked list node: { val, next }          (last node's next is null)

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export interface ListNode {
  val: number;
  next: ListNode | null;
}

/** Builds a height-balanced BST from a sorted array of distinct integers. */
export function sortedArrayToBST(nums: number[]): TreeNode | null {
  // TODO: recurse on inclusive index bounds (lo, hi) — NOT on slice() copies;
  // base case lo > hi → null; mid = (lo + hi) >> 1 becomes the root,
  // left = build(lo, mid - 1), right = build(mid + 1, hi)
  return null;
}

/** Sorts a linked list ascending in O(n log n), relinking existing nodes. */
export function sortList(head: ListNode | null): ListNode | null {
  // TODO: merge sort — base case 0 or 1 nodes;
  // split with slow = head, fast = head.next (fast head start!),
  // cut with slow.next = null, recurse on both halves, then merge
  // with a dummy head + tail pointer
  return null;
}

/**
 * Merges k sorted linked lists into one sorted list in O(N log k),
 * reusing the existing nodes.
 */
export function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
  // TODO: pairwise rounds — while more than one list remains, merge
  // lists[i] with lists[i+1] (odd one passes through); reuse the same
  // two-list merge as sortList
  return null;
}

function fromArray(values: number[]): ListNode | null {
  let head: ListNode | null = null;
  let tail: ListNode | null = null;
  for (const v of values) {
    const node: ListNode = { val: v, next: null };
    if (head === null) head = node;
    else tail!.next = node;
    tail = node;
  }
  return head;
}

function toArray(head: ListNode | null): number[] {
  const out: number[] = [];
  for (let n = head; n !== null; n = n.next) out.push(n.val);
  return out;
}

function main(): void {
  console.log(JSON.stringify(sortedArrayToBST([1, 2, 3])));
  // {"val":2,"left":{"val":1,...},"right":{"val":3,...}}

  console.log(toArray(sortList(fromArray([4, 2, 1, 3]))));
  // [1, 2, 3, 4]

  const lists = [fromArray([1, 4, 5]), fromArray([1, 3, 4]), fromArray([2, 6])];
  console.log(toArray(mergeKLists(lists)));
  // [1, 1, 2, 3, 4, 4, 5, 6]
}

main();
