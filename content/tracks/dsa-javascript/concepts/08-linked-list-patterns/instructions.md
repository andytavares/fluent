# Linked List Patterns

## What you'll learn

The three pointer patterns that cover the vast majority of linked list interview problems: iterative reversal, Floyd's cycle detection, and the dummy-node merge technique.

## Key concepts

Linked list problems punish you for losing track of pointers. The discipline: always save `next` before you overwrite it, and use a dummy head node when the merge/result head is unknown at the start.

### Reverse a linked list — three-pointer iterative

```js
let prev = null, curr = head;
while (curr) {
  const next = curr.next; // save before overwriting
  curr.next = prev;
  prev = curr;
  curr = next;
}
return prev; // new head
```

### Cycle detection — Floyd's algorithm

Slow moves 1 step, fast moves 2. If they meet, there's a cycle. If fast reaches null, no cycle.

```js
let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow === fast) return true;
}
return false;
```

### Merge two sorted lists — dummy head node

A dummy `prev` node before the result eliminates the special case of an empty result list.

```js
function mergeTwoSortedLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
    else                  { curr.next = l2; l2 = l2.next; }
    curr = curr.next;
  }
  curr.next = l1 ?? l2; // attach remaining non-null list
  return dummy.next;
}
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| reverseList | O(n) | O(1) |
| hasCycle | O(n) | O(1) |
| mergeTwoSortedLists | O(m + n) | O(1) |

## Common variations

- **Reverse a sublist** (LC 92) — reverse k nodes in place; requires saving the pre-sublist tail
- **Find cycle start** (LC 142) — after Floyd detection, reset one pointer to head; advance both one step; they meet at cycle start
- **Merge k sorted lists** — min-heap of (value, node) pairs; O(n log k)
- **Remove nth node from end** — two pointers n+1 apart; move together until far pointer exits

## vs other languages

Python's `None` vs JavaScript's `null` — otherwise the patterns are identical. In Java you'd use `ListNode` from the LeetCode stub. The key insight that carries across all languages: linked list problems are about pointer state, not data structures.

## FAANG follow-up questions

After hasCycle:
- "How do you find the start of the cycle?" (after meeting point, reset one pointer to head; advance both one step at a time; they meet at cycle start — mathematical proof involves distances)
- "Can you do it without O(n) space?" (Floyd's is O(1) space — that's the point)

After mergeTwoSortedLists:
- "What if you have k sorted lists?" (min-heap approach: push all heads, pop minimum, push its next; O(n log k))
- "What if the lists are doubly linked?" (update `prev` pointers too; same O(m+n) time)

After reverseList:
- "Can you do it recursively?" (yes — `head.next.next = head; head.next = null; return newHead` — O(n) space due to call stack)
- "How do you reverse only a sublist from position m to n?" (advance to position m-1, reverse n-m+1 nodes, reconnect)

## Watch out

- **reverseList**: save `curr.next` to `next` BEFORE setting `curr.next = prev`. Forgetting this severs the list.
- **hasCycle**: check `fast && fast.next` (not `fast.next && fast.next.next`) — check the node before its successor to avoid null dereference.
- **mergeTwoSortedLists**: `curr.next = l1 ?? l2` attaches whichever list remains. Don't loop to the end — just link the rest.
- **null head**: all three functions must handle `null` input without throwing.

## The task

A `ListNode` class is provided in the stub:

```js
class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
```

### `reverseList(head)`

Reverse a singly linked list in-place. Return the new head.

```js
// 1 -> 2 -> 3 -> null  becomes  3 -> 2 -> 1 -> null
```

### `hasCycle(head)`

Return `true` if the linked list contains a cycle. Use Floyd's algorithm — O(1) space.

### `mergeTwoSortedLists(l1, l2)`

Merge two sorted linked lists and return the head of the merged sorted list. Do it in-place (no new nodes, just pointer rewiring). Use a dummy head node.

```js
// [1,2,4] + [1,3,4] -> [1,1,2,3,4,4]
// [] + [0] -> [0]
```
