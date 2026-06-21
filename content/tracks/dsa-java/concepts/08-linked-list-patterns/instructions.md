# Linked List Patterns

## What you'll learn

The three canonical linked list operations that appear in nearly every FAANG interview involving lists: in-place reversal, cycle detection with Floyd's algorithm, and merging two sorted lists.

## Key concepts

### Pattern 1 — Iterative reversal

Save `next` before overwriting it. Three moving parts: `prev`, `curr`, `next`.

```java
public static ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next; // save before overwrite
        curr.next = prev;          // reverse the pointer
        prev = curr;
        curr = next;
    }
    return prev; // new head
}
```

### Pattern 2 — Floyd's cycle detection (tortoise and hare)

Two pointers at different speeds. If they ever point to the same node, there's a cycle. If fast reaches null, there's no cycle.

```java
public static boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true; // reference equality — same node object
    }
    return false;
}
```

Use `slow == fast` (reference equality), not `.equals()`. You're checking if two pointers point to the *same object*.

### Pattern 3 — Dummy head node (Merge Two Sorted Lists)

A dummy head node eliminates special-casing the first node. Advance a `tail` pointer and attach nodes from either list in sorted order.

```java
public static ListNode mergeTwoSortedLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0); // sentinel — never part of the result
    ListNode tail = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
        else                  { tail.next = l2; l2 = l2.next; }
        tail = tail.next;
    }
    tail.next = (l1 != null) ? l1 : l2; // attach remaining nodes
    return dummy.next;
}
```

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `reverseList` | O(n) | O(1) | One pass; three pointer variables |
| `hasCycle` | O(n) | O(1) | Fast pointer laps slow in at most n steps |
| `mergeTwoSortedLists` | O(m+n) | O(1) | Visit each node once; no extra allocation |

## Common variations this pattern solves

1. **Reverse Linked List II** — reverse a sublist between positions `left` and `right`
2. **Find Cycle Start** — extend Floyd's: after detection, move one pointer to head and advance both at speed 1; they meet at the cycle's entry
3. **Reorder List** — find middle (fast/slow), reverse second half, merge interleaved
4. **Merge K Sorted Lists** — divide and conquer: merge pairs, then pairs of pairs (O(n log k))

## vs other languages

In Python, `node.next` can become `None` — a direct equivalent to Java's `null`. The key difference: Java's `==` on objects always compares references. In Python, `is` compares identity; `==` may call `__eq__`. For cycle detection you need reference equality, which is `==` in Java and `is` in Python.

C/C++ linked list code uses raw pointers with explicit null pointer (`nullptr`). Java references are always non-null after construction (unless assigned `null`) and can't be dereferenced if null without NPE.

## Watch out

- **Null check order in cycle detection**: `fast != null && fast.next != null` — check `fast` before `fast.next`. Reversing the order causes NPE.
- **`== null` vs `.equals(null)`**: never call `.equals()` on a potentially-null node reference — that throws NPE. Always use `node == null`.
- **Dummy node is not returned**: `mergeTwoSortedLists` returns `dummy.next`, not `dummy`. Returning `dummy` is the most common bug.
- **Don't call `new ListNode()` in `hasCycle` or `reverseList`**: these are O(1) space solutions. Any allocation is a red flag.

## FAANG follow-up questions

> "Can you detect the start of a cycle, not just its existence?" — Yes. After slow/fast meet, move one pointer back to head. Advance both at speed 1. They meet at the cycle's entry node.
>
> "How would you reverse a linked list recursively?" — `reverseList(head.next)` returns the new head; `head.next.next = head; head.next = null`. O(n) time but O(n) stack space.
>
> "What if mergeTwoSortedLists lists have different types (e.g., Comparable)?" — Use generics: `ListNode<T extends Comparable<T>>`. The comparison becomes `l1.val.compareTo(l2.val) <= 0`.
>
> "Why use a dummy head node?" — It eliminates the special case for the first node, keeping the loop body uniform. Without it, you'd need an `if` block before the loop to initialize the result head.

## The task

`ListNode` is defined in the test file:
```java
static class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}
```

Implement three methods in `Solution`:

```java
// Reverses the linked list in-place and returns the new head.
// [1->2->3->4->5] -> [5->4->3->2->1]
public static ListNode reverseList(ListNode head)

// Returns true if the linked list contains a cycle.
public static boolean hasCycle(ListNode head)

// Merges two sorted linked lists and returns the merged sorted list.
// [1->2->4] + [1->3->4] -> [1->1->2->3->4->4]
public static ListNode mergeTwoSortedLists(ListNode l1, ListNode l2)
```
