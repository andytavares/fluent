// Run: node stub.js
//
// Every list node is a plain object { val, next }; next is null at the tail.
// An empty list is null.

/**
 * Returns true if the list contains a cycle.
 * @param {{val: number, next: object|null}|null} head
 * @returns {boolean}
 */
function hasCycle(head) {
  // TODO: Floyd's fast/slow — slow moves 1, fast moves 2
  // loop while fast !== null && fast.next !== null; compare node identity
  return false;
}

/**
 * Adds two numbers stored as reverse-order digit lists (head = ones digit).
 * Returns the sum in the same format.
 * @param {{val: number, next: object|null}} l1
 * @param {{val: number, next: object|null}} l2
 * @returns {{val: number, next: object|null}}
 */
function addTwoNumbers(l1, l2) {
  // TODO: dummy head + carry; loop while l1 || l2 || carry
  // digit = sum % 10, carry = Math.floor(sum / 10)
  return null;
}

/**
 * Merges two sorted lists by splicing the existing nodes. Returns the head.
 * @param {{val: number, next: object|null}|null} list1
 * @param {{val: number, next: object|null}|null} list2
 * @returns {{val: number, next: object|null}|null}
 */
function mergeTwoLists(list1, list2) {
  // TODO: dummy head + tail; attach the smaller head each step,
  // then attach the leftover list; return dummy.next
  return null;
}

/**
 * Reverses positions left..right (1-indexed) in place. Returns the head.
 * @param {{val: number, next: object|null}|null} head
 * @param {number} left
 * @param {number} right
 * @returns {{val: number, next: object|null}|null}
 */
function reverseBetween(head, left, right) {
  // TODO: dummy head; walk prev to position left-1; front-insert the node
  // after start, right-left times; return dummy.next
  return null;
}

module.exports = { hasCycle, addTwoNumbers, mergeTwoLists, reverseBetween };

function main() {
  const list = (...vals) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of vals) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toArray = (head) => {
    const out = [];
    for (let node = head; node !== null; node = node.next) out.push(node.val);
    return out;
  };

  const cyclic = list(3, 2, 0, -4);
  cyclic.next.next.next.next = cyclic.next; // -4 loops back to 2
  console.log(hasCycle(cyclic)); // true
  console.log(JSON.stringify(toArray(addTwoNumbers(list(2, 4, 3), list(5, 6, 4))))); // [7,0,8]
  console.log(JSON.stringify(toArray(mergeTwoLists(list(1, 2, 4), list(1, 3, 4))))); // [1,1,2,3,4,4]
  console.log(JSON.stringify(toArray(reverseBetween(list(1, 2, 3, 4, 5), 2, 4)))); // [1,4,3,2,5]
}

main();
