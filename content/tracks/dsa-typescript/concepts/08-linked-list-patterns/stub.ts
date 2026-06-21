// Run: tsx stub.ts

export class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

// Reverse a singly linked list and return the new head.
export function reverseList(head: ListNode | null): ListNode | null {
  // TODO: iterative reversal with prev/curr/nextTemp
  return null;
}

// Return true if the list contains a cycle (Floyd's algorithm, O(1) space).
export function hasCycle(head: ListNode | null): boolean {
  // TODO: slow moves 1 step, fast moves 2; if they meet, cycle exists
  return false;
}

// Merge two sorted linked lists and return the new sorted head.
export function mergeTwoSortedLists(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  // TODO: use a dummy head; advance the pointer with the smaller val each step;
  // attach the remaining non-empty list at the end
  return null;
}

// Usage examples (uncomment to test manually):
// const list = new ListNode(1, new ListNode(2, new ListNode(3)));
// console.log(reverseList(list)?.val); // 3
// console.log(hasCycle(list));         // false
