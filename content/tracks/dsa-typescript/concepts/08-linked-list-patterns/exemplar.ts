// Run: tsx exemplar.ts
//
// Every list node has this shape; next is null at the tail.
// An empty list is null.

interface ListNode {
  val: number;
  next: ListNode | null;
}

/**
 * Returns true if the list contains a cycle.
 * Floyd's fast/slow: fast gains one node per step inside a cycle, so the
 * pointers must meet; if fast reaches null, the list terminates.
 * O(n) time, O(1) space.
 */
function hasCycle(head: ListNode | null): boolean {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true; // identity, never value comparison
  }
  return false;
}

/**
 * Adds two numbers stored as reverse-order digit lists (head = ones digit).
 * Reverse order means the walk adds digits exactly as carries propagate.
 * The `|| carry` in the loop condition emits the final carry digit.
 * O(max(m, n)) time, O(1) space beyond the output.
 */
function addTwoNumbers(l1: ListNode, l2: ListNode): ListNode {
  const dummy: ListNode = { val: 0, next: null };
  let tail = dummy;
  let carry = 0;
  let n1: ListNode | null = l1;
  let n2: ListNode | null = l2;
  while (n1 !== null || n2 !== null || carry !== 0) {
    const sum = (n1 !== null ? n1.val : 0) + (n2 !== null ? n2.val : 0) + carry;
    tail.next = { val: sum % 10, next: null };
    tail = tail.next;
    carry = Math.floor(sum / 10);
    if (n1 !== null) n1 = n1.next;
    if (n2 !== null) n2 = n2.next;
  }
  return dummy.next!;
}

/**
 * Merges two sorted lists by splicing the existing nodes. Returns the head.
 * The dummy head absorbs the "which list starts the result?" question, and
 * attaching the leftover list whole avoids walking it.
 * O(m + n) time, O(1) space.
 */
function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy: ListNode = { val: 0, next: null };
  let tail = dummy;
  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 !== null ? list1 : list2;
  return dummy.next;
}

/**
 * Reverses positions left..right (1-indexed) in place. Returns the head.
 * Front-insertion: anchor prev before the window, then move the node after
 * `start` to the window's front, right-left times — the window ends up
 * reversed and already spliced.
 * O(n) time, O(1) space, one pass.
 */
function reverseBetween(head: ListNode | null, left: number, right: number): ListNode | null {
  const dummy: ListNode = { val: 0, next: head };
  let prev = dummy;
  for (let i = 0; i < left - 1; i++) prev = prev.next!;

  const start = prev.next!; // becomes the window's tail
  for (let i = 0; i < right - left; i++) {
    const move = start.next!;
    start.next = move.next;
    move.next = prev.next;
    prev.next = move;
  }
  return dummy.next;
}

export { ListNode, hasCycle, addTwoNumbers, mergeTwoLists, reverseBetween };

function main() {
  const list = (...vals: number[]): ListNode | null => {
    const dummy: ListNode = { val: 0, next: null };
    let tail = dummy;
    for (const v of vals) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toArray = (head: ListNode | null): number[] => {
    const out: number[] = [];
    for (let node = head; node !== null; node = node.next) out.push(node.val);
    return out;
  };

  const cyclic = list(3, 2, 0, -4)!;
  cyclic.next!.next!.next!.next = cyclic.next; // -4 loops back to 2
  console.log(hasCycle(cyclic)); // true
  console.log(JSON.stringify(toArray(addTwoNumbers(list(2, 4, 3)!, list(5, 6, 4)!)))); // [7,0,8]
  console.log(JSON.stringify(toArray(mergeTwoLists(list(1, 2, 4), list(1, 3, 4))))); // [1,1,2,3,4,4]
  console.log(JSON.stringify(toArray(reverseBetween(list(1, 2, 3, 4, 5), 2, 4)))); // [1,4,3,2,5]
}

main();
