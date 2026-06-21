# Linked List Patterns

## What you'll learn

The four pointer-manipulation patterns that cover ~90% of linked list interview problems: reversal, cycle detection (Floyd's algorithm), merge, and the sentinel/dummy-head technique.

## Key concepts

Python has no built-in linked list. You define `ListNode` and manipulate `.next` references directly. The discipline is tracking `prev`, `curr`, and `next_node` without losing references.

```python
class ListNode:
    def __init__(self, val: int = 0, next: "ListNode | None" = None) -> None:
        self.val = val
        self.next = next
```

### Reverse in place — iterative, O(1) space

```python
def reverse_list(head: ListNode | None) -> ListNode | None:
    prev: ListNode | None = None
    curr = head
    while curr:
        next_node = curr.next    # save before overwriting
        curr.next = prev         # reverse the pointer
        prev = curr
        curr = next_node
    return prev                  # prev is the new head
```

### Cycle detection — Floyd's two-pointer

Fast pointer moves 2 steps, slow moves 1. If there's a cycle, they must meet inside it.

```python
def has_cycle(head: ListNode | None) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
```

**Why `fast.next` in the condition?** `fast.next.next` would raise `AttributeError` if `fast.next` is `None`. Always guard both.

### Merge two sorted lists — sentinel (dummy) head

A dummy node before the result list eliminates the special-case for inserting the first element.

```python
def merge_two_sorted_lists(
    l1: ListNode | None, l2: ListNode | None
) -> ListNode | None:
    dummy = ListNode(0)
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2        # attach whichever list is non-empty
    return dummy.next
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Reverse list | O(n) | O(1) |
| Has cycle | O(n) | O(1) |
| Merge two sorted lists | O(m + n) | O(1) |

## Common variations

- **Remove Nth Node From End** — two pointers with n-step gap; when fast hits the end, slow is at the node before the target
- **Linked List Cycle II** — find the cycle's entry node (not just detect it); use mathematical proof: after meeting, reset one pointer to head, advance both by 1
- **Reorder List** — find middle (fast/slow), reverse second half, merge interleaved
- **Merge K Sorted Lists** — use a min-heap of (value, list_index, node); O(n log k)

## vs other languages

Python's garbage collector handles memory — you never `free` a node. Java's `ListNode` is identical in structure but you'd need to handle `NullPointerException` for null dereferences. C++ requires explicit `delete` and smart pointers to avoid leaks. Python also lacks a `->` operator; `curr.next` is direct attribute access.

The sentinel/dummy head pattern (`dummy = ListNode(0); dummy.next = head`) is universally applicable and eliminates all "is this the first node?" edge cases.

## Watch out

- **Infinite loops:** always advance `curr` on every branch — a forgotten `curr = curr.next` creates an infinite loop.
- **`slow is fast` (identity), not `slow == fast` (equality).** Two different nodes can have the same value. Use `is` for pointer comparison.
- **`fast and fast.next`** in cycle detection — checking `fast.next.next` without this guard raises `AttributeError`.
- **`curr.next = l1 or l2`** — Python's `or` returns the first truthy value. If `l1` is not `None`, it attaches `l1`; otherwise `l2` (which may also be `None` — that's the empty case, and it's correct).
- **`from __future__ import annotations`** — enables forward reference `"ListNode | None"` syntax in Python 3.8; without it, the class hasn't finished defining when `__init__` type hint is evaluated.

## FAANG follow-up questions

> "Can you reverse a linked list recursively?" — Yes: `return reverse_recursive(head.next); head.next.next = head; head.next = None`. But this uses O(n) call stack space. The iterative version is preferred.

> "How do you find the cycle entry node (not just detect)?" — After slow and fast meet inside the cycle, reset slow to head. Advance both by 1 step at a time. They meet at the cycle entry. This works due to the mathematical relationship between distances.

> "What if you need to merge K sorted lists?" — Use `heapq.heappush` / `heappop` with `(node.val, i, node)` tuples. The tiebreak on `i` prevents comparing `ListNode` objects. O(n log k) time.

## The task

```python
class ListNode:
    def __init__(self, val: int = 0, next: "ListNode | None" = None) -> None:
        self.val = val
        self.next = next

def reverse_list(head: ListNode | None) -> ListNode | None:
    """Reverse the linked list in place. Return the new head."""

def has_cycle(head: ListNode | None) -> bool:
    """Return True if the linked list contains a cycle."""

def merge_two_sorted_lists(
    l1: ListNode | None, l2: ListNode | None
) -> ListNode | None:
    """Merge two sorted linked lists and return the head of the merged list."""
```

**Examples:**
- `reverse_list(1->2->3->4->5)` → `5->4->3->2->1`
- `reverse_list(None)` → `None`
- `has_cycle` on `1->2->3` with tail pointing to node 2 → `True`
- `has_cycle(1->2->3)` → `False`
- `merge_two_sorted_lists(1->2->4, 1->3->4)` → `1->1->2->3->4->4`
- `merge_two_sorted_lists([], [0])` → `0`
