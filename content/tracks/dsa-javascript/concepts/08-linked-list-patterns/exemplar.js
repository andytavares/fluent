// Run: node exemplar.js

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
 * Save next before overwriting — the classic three-pointer swap.
 * O(n) time, O(1) space.
 * @param {ListNode|null} head
 * @returns {ListNode|null}
 */
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next; // must save before overwriting
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev; // new head
}

/**
 * Returns true if the linked list contains a cycle.
 * Floyd's tortoise and hare: slow +1, fast +2. If they meet, cycle exists.
 * O(n) time, O(1) space.
 * @param {ListNode|null} head
 * @returns {boolean}
 */
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

/**
 * Merges two sorted linked lists in-place. Returns the head of the merged list.
 * Dummy head node eliminates the special case of an empty result list.
 * O(m + n) time, O(1) space.
 * @param {ListNode|null} l1
 * @param {ListNode|null} l2
 * @returns {ListNode|null}
 */
function mergeTwoSortedLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
    else                  { curr.next = l2; l2 = l2.next; }
    curr = curr.next;
  }
  curr.next = l1 ?? l2; // attach whichever list remains
  return dummy.next;
}

module.exports = { ListNode, listFromArray, listToArray, reverseList, hasCycle, mergeTwoSortedLists };

function main() {
  console.log(listToArray(reverseList(listFromArray([1, 2, 3, 4, 5])))); // [5,4,3,2,1]
  console.log(hasCycle(listFromArray([1, 2, 3]))); // false
  console.log(listToArray(mergeTwoSortedLists(listFromArray([1, 2, 4]), listFromArray([1, 3, 4])))); // [1,1,2,3,4,4]
}

main();
