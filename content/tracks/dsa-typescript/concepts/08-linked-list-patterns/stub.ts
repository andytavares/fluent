// Run: tsx stub.ts
//
// Every list node has this shape; next is null at the tail.
// An empty list is null.

interface ListNode {
  val: number;
  next: ListNode | null;
}

/**
 * Returns true if the list contains a cycle.
 */
function hasCycle(head: ListNode | null): boolean {
  // TODO: Floyd's fast/slow — slow moves 1, fast moves 2
  // loop while fast !== null && fast.next !== null; compare node identity
  return false;
}

/**
 * Adds two numbers stored as reverse-order digit lists (head = ones digit).
 * Returns the sum in the same format.
 */
function addTwoNumbers(l1: ListNode, l2: ListNode): ListNode {
  // TODO: dummy head + carry; loop while l1 || l2 || carry
  // digit = sum % 10, carry = Math.floor(sum / 10)
  return { val: 0, next: null };
}

/**
 * Merges two sorted lists by splicing the existing nodes. Returns the head.
 */
function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  // TODO: dummy head + tail; attach the smaller head each step,
  // then attach the leftover list; return dummy.next
  return null;
}

/**
 * Reverses positions left..right (1-indexed) in place. Returns the head.
 */
function reverseBetween(head: ListNode | null, left: number, right: number): ListNode | null {
  // TODO: dummy head; walk prev to position left-1; front-insert the node
  // after start, right-left times; return dummy.next
  return null;
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
