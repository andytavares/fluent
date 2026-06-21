// Run: tsx exemplar.ts

export class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

export function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr !== null) {
    const nextTemp = curr.next; // must save before overwriting
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev; // new head
}

export function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;     // safe: fast guard ensures slow is non-null
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

export function mergeTwoSortedLists(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0); // sentinel absorbs the head special-case
  let curr = dummy;

  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next!;
  }
  curr.next = l1 ?? l2; // attach the non-exhausted remainder

  return dummy.next;
}
