# Linked List Patterns

## What you'll learn

The three pointer manipulation techniques that cover 90% of linked list interview questions: in-place reversal, fast/slow pointers, and dummy-head merging. You'll implement `reverseList`, `hasCycle`, and `mergeTwoSortedLists`.

## Key concepts

### In-place reversal

Relink `next` pointers without allocating a new list. Three variables suffice: `prev`, `curr`, and a temporary save of `curr.next`.

```typescript
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr !== null) {
    const nextTemp = curr.next; // save before overwriting
    curr.next = prev;           // reverse the link
    prev = curr;                // advance prev
    curr = nextTemp;            // advance curr
  }
  return prev; // prev is now the new head
}
```

**State after each step for `1→2→3`**:
- Start: prev=null, curr=1
- After step 1: prev=1, curr=2; link is 1→null
- After step 2: prev=2, curr=3; links are 2→1→null
- After step 3: prev=3, curr=null; links are 3→2→1→null

### Fast/slow pointers — cycle detection (Floyd's algorithm)

`slow` moves 1 step; `fast` moves 2. If a cycle exists, fast eventually laps slow — they'll meet. If fast reaches `null`, no cycle.

```typescript
function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;      // 1 step
    fast = fast.next.next;  // 2 steps
    if (slow === fast) return true; // same node object = cycle
  }
  return false;
}
```

**Why O(1) space**: no visited set needed. The lapping argument: in a cycle of length L, fast gains 1 on slow per step, so they meet within L steps after entering the cycle.

### Dummy head — merging two sorted lists

Prepend a sentinel node so you never special-case the head. The merged list starts at `dummy.next`.

```typescript
function mergeTwoSortedLists(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0); // sentinel — never part of the answer
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
  // Attach the remaining non-empty list
  curr.next = l1 ?? l2;

  return dummy.next;
}
```

**Why the dummy head**: without it, you'd need to special-case which list provides the head node. The dummy absorbs this complexity.

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `reverseList` | O(n) | O(1) | Three pointers, no allocation |
| `hasCycle` | O(n) | O(1) | Floyd's algorithm |
| `mergeTwoSortedLists` | O(n + m) | O(1) | Relinks existing nodes |

## Common variations

| Technique | Problems |
|-----------|----------|
| Reversal | Reverse linked list II (partial), palindrome linked list |
| Fast/slow | Find middle, detect cycle start, kth from end |
| Dummy head | Merge k sorted lists, remove nth from end, partition list |

## vs other languages

TypeScript's `ListNode | null` makes null safety explicit at compile time — unlike Java where a null reference is typed as any class. The `slow!.next` non-null assertion is safe because the loop guard `fast !== null && fast.next !== null` ensures `slow` is non-null when the inner body executes. Without the guard, `!` hides a runtime crash.

## Watch out

- **`fast.next.next` vs `fast.next?.next`**: optional chaining returns `undefined`, not `null`. Your `ListNode.next` is typed as `ListNode | null`, so `undefined` would be a type mismatch. Use the explicit `fast !== null && fast.next !== null` guard, not optional chaining.
- **Reversal order**: you MUST save `curr.next` into `nextTemp` BEFORE `curr.next = prev`. Reversing without the save loses the rest of the list.
- **`curr.next = l1 ?? l2` in merge**: the `??` (nullish coalescing) picks `l1` if it's non-null, otherwise `l2`. This correctly attaches the leftover portion of whichever list is not exhausted.
- **Equal values in merge**: `l1.val <= l2.val` (not `<`) preserves stable ordering and handles duplicates correctly.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you reverse only nodes from position m to n?" (Walk to position m-1 with a dummy head, then reverse the sublist, then reattach.)
> - "How would you merge k sorted lists?" (Use a min-heap of size k: repeatedly extract the smallest and push its successor. O(n log k).)
> - "Can you find where a cycle starts, not just whether one exists?" (After Floyd's detection finds the meeting point, reset one pointer to `head`. Both advance at 1 step/iter; they meet at the cycle start.)
> - "How do you check if a linked list is a palindrome in O(n) time and O(1) space?" (Find middle, reverse the second half, compare, restore.)

## The task

Implement the `ListNode` class and three functions:

```typescript
// The node class — export it so the test can build lists.
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number, next?: ListNode | null)
}

// Reverse the list and return the new head.
// 1→2→3→4→5 → 5→4→3→2→1
// null → null
function reverseList(head: ListNode | null): ListNode | null

// Return true if the list contains a cycle (Floyd's O(1)-space algorithm).
function hasCycle(head: ListNode | null): boolean

// Merge two sorted linked lists and return the sorted merged head.
// l1: 1→2→4, l2: 1→3→4 → 1→1→2→3→4→4
// l1: [], l2: 0 → 0
function mergeTwoSortedLists(l1: ListNode | null, l2: ListNode | null): ListNode | null
```
