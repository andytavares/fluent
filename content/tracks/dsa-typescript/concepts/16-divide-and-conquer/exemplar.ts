// Run: tsx exemplar.ts
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

/**
 * Builds a height-balanced BST by making the middle element the root and
 * recursing on the halves: sortedness gives the BST property for free, and
 * halving bounds the subtree height difference by 1 at every node.
 * Recursing on index bounds (not slices) keeps it O(n).
 * O(n) time, O(log n) recursion depth.
 */
export function sortedArrayToBST(nums: number[]): TreeNode | null {
  function build(lo: number, hi: number): TreeNode | null {
    if (lo > hi) return null;
    const mid = (lo + hi) >> 1;
    return {
      val: nums[mid],
      left: build(lo, mid - 1),
      right: build(mid + 1, hi),
    };
  }
  return build(0, nums.length - 1);
}

/**
 * Merges two sorted lists by relinking existing nodes: dummy head + tail
 * pointer, always appending the smaller front node, then splicing the
 * leftover run. Handles null inputs naturally. O(|a| + |b|) time.
 */
function mergeTwo(a: ListNode | null, b: ListNode | null): ListNode | null {
  const dummy: ListNode = { val: 0, next: null };
  let tail = dummy;
  while (a !== null && b !== null) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;
  return dummy.next;
}

/**
 * Merge sort on a linked list: fast/slow split (fast starts at head.next so
 * a 2-node list splits 1 + 1), CUT the list so the halves are independent,
 * recurse, then merge. Only pointers move — no nodes are allocated.
 * O(n log n) time, O(log n) recursion stack.
 */
export function sortList(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) return head;

  let slow = head;
  let fast: ListNode | null = head.next;
  while (fast !== null && fast.next !== null) {
    slow = slow.next!;
    fast = fast.next.next;
  }
  const mid = slow.next;
  slow.next = null; // cut — without this the recursion never shrinks

  return mergeTwo(sortList(head), sortList(mid));
}

/**
 * Merges k sorted lists by pairwise rounds: each round halves the list
 * count, and every node is touched once per round → O(N log k) total,
 * versus O(N·k) for sequential folding.
 * O(N log k) time, O(1) extra space beyond the round arrays.
 */
export function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
  if (lists.length === 0) return null;
  let current = lists;
  while (current.length > 1) {
    const merged: (ListNode | null)[] = [];
    for (let i = 0; i < current.length; i += 2) {
      merged.push(i + 1 < current.length ? mergeTwo(current[i], current[i + 1]) : current[i]);
    }
    current = merged;
  }
  return current[0];
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
  // {"val":2,"left":{"val":1,"left":null,"right":null},"right":{"val":3,"left":null,"right":null}}

  console.log(toArray(sortList(fromArray([4, 2, 1, 3]))));
  // [1, 2, 3, 4]

  const lists = [fromArray([1, 4, 5]), fromArray([1, 3, 4]), fromArray([2, 6])];
  console.log(toArray(mergeKLists(lists)));
  // [1, 1, 2, 3, 4, 4, 5, 6]
}

main();
