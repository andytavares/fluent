// Run: node stub.js

class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

/** Helper: build a linked list from an array. */
function listFromArray(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) {
    head = new ListNode(arr[i], head);
  }
  return head;
}

/** Helper: collect a linked list into an array (non-cyclic only). */
function listToArray(head) {
  const arr = [];
  while (head) { arr.push(head.val); head = head.next; }
  return arr;
}

/**
 * Reverses a singly linked list in-place. Returns the new head.
 * @param {ListNode|null} head
 * @returns {ListNode|null}
 */
function reverseList(head) {
  // TODO: three-pointer iterative — save next, flip curr.next to prev, advance
  return null;
}

/**
 * Returns true if the linked list contains a cycle.
 * @param {ListNode|null} head
 * @returns {boolean}
 */
function hasCycle(head) {
  // TODO: Floyd's algorithm — slow +1, fast +2; return true if they meet
  return false;
}

/**
 * Merges two sorted linked lists in-place. Returns the head of the merged list.
 * @param {ListNode|null} l1
 * @param {ListNode|null} l2
 * @returns {ListNode|null}
 */
function mergeTwoSortedLists(l1, l2) {
  // TODO: dummy head; compare l1.val vs l2.val; attach smaller; advance; attach remainder
  return null;
}

module.exports = { ListNode, listFromArray, listToArray, reverseList, hasCycle, mergeTwoSortedLists };

function main() {
  console.log(listToArray(reverseList(listFromArray([1, 2, 3, 4, 5])))); // [5,4,3,2,1]
  console.log(hasCycle(listFromArray([1, 2, 3]))); // false
  console.log(listToArray(mergeTwoSortedLists(listFromArray([1, 2, 4]), listFromArray([1, 3, 4])))); // [1,1,2,3,4,4]
}

main();
