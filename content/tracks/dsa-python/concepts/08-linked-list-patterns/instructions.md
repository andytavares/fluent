## What you build

You write four pointer-surgery functions on singly linked lists: `has_cycle`, `add_two_numbers`, `merge_two_lists` and `reverse_between`. Four moves solve this whole group: the dummy head, fast and slow pointers, in-place reversal and splicing. They reach up to LRU Cache, a hash-map-plus-linked-list design used in real caches. This lesson builds on **Stack**.

## Key concepts

### A node is a `ListNode` with `val` and `next`

Every list node here is a small `ListNode` object with a value and a pointer to the next node. The tail's `next` is `None`.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# 1 -> 2 -> 3
head = ListNode(1, ListNode(2,
    ListNode(3, None)))
```

An empty list is `None`. There is no list wrapper class. A walk is `while node is not None: node = node.next`. Every delete or insert is a pointer change, never a list shift.

### A dummy head removes the head special case

Some operations can replace or remove the first node, such as merge, delete and partition. A throwaway node in front makes them much simpler.

```python
dummy = ListNode(0, head)
tail = dummy
# Build or patch the list through
# tail.next.
# Return the real head, whatever it is.
return dummy.next
```

Without the sentinel, you write "if the node to delete is the head" branches everywhere. With it, the head is one more `next` pointer, and the same code handles it.

### Fast and slow pointers

Advance `fast` two steps for every one step of `slow`.

```python
slow = fast = head
while (fast is not None and
       fast.next is not None):
    slow = slow.next
    fast = fast.next.next
    # Cycle: they met.
    if slow is fast:
        return True
# fast fell off the end: no cycle.
return False
```

In a cycle, both pointers end up inside it. Each step shrinks the gap between them by exactly one, so they must meet. Without a cycle, `fast` reaches `None` within n/2 steps.

The same skeleton with other offsets finds the middle node: `slow` is at the middle when `fast` reaches the end. It also finds the nth node from the end: give `fast` a head start of n.

Compare nodes by identity (`slow is fast` on node references), never by value. Values can repeat.

### In-place reversal uses three pointers

This loop reverses a list without allocation.

```python
prev, curr = None, head
while curr is not None:
    # Save next before you overwrite it.
    next_node = curr.next
    # Flip the pointer.
    curr.next = prev
    prev = curr
    curr = next_node
# prev is the new head.
```

Reverse Linked List II applies this idea to a window `[left, right]`, then splices the window back in. The node before the window points at the window's new head. The window's old head, now its tail, points at the node after the window.

### Splicing cuts and reconnects a list

Rotate List finds the new tail, cuts there and attaches the old tail to the old head. Partition List builds two lists under two dummy heads, then joins them. Set the second list's last `next` to `None`, or you build an accidental cycle.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Linked List Cycle | O(n) | O(1) | Floyd fast/slow |
| Add Two Numbers | O(max(m, n)) | O(1) extra | dummy head + carry |
| Merge Two Sorted Lists | O(m + n) | O(1) | dummy head + splice |
| Reverse Linked List II | O(n) | O(1) | window reversal + splice |

## Watch out

- Save `curr.next` before you overwrite it. After `curr.next = prev`, the rest of the list is lost.
- Return `dummy.next`, not `head`. After a merge or delete, `head` can be in the middle of the list.
- Check both `fast` and `fast.next` in the Floyd loop. Otherwise `fast.next.next` raises `AttributeError` on even-length lists.
- Compare node identity with `is`, not values with `==`. `has_cycle` on `1 -> 1 -> 1 -> None` must return `False`.
- In Add Two Numbers, keep the final carry. `5 + 5` is `[0, 1]`, not `[0]`. Loop `while l1 or l2 or carry`.
- `reverse_between` positions are 1-indexed. `left == right` must change nothing and must not crash.
- In LRU Cache, a `get` is also a use. If reads do not refresh recency, the cache evicts hot keys.

## Problem walkthroughs

### Linked List Cycle ★

**Problem.** Given the head of a singly linked list, return `True` if the list has a cycle. In a cycle, some node's `next` points back to an earlier node. Return `False` if the list ends in `None`. Use O(1) space.

**Example.**

```text
3 -> 2 -> 0 -> -4, and -4.next
points back at node 2 -> True
1 -> 2 -> None -> False
```

**Steps.**
1. Set `slow = head` and `fast = head`.
2. Loop while `fast is not None and fast.next is not None`. Move `slow` one step and `fast` two.
3. After the move, if `slow is fast` (identity comparison), return `True`.
4. If the loop ends, `fast` walked off the end, so return `False`.
5. They must meet. Inside the cycle, `fast` gains one node per step on `slow`, so the gap reaches zero within one lap. A `set` of visited nodes also works, but it uses O(n) space and fails the follow-up.

**Complexity.** O(n) time / O(1) space. `slow` never completes a second lap.

### Add Two Numbers ★

**Problem.** Two non-empty lists hold non-negative integers with digits in reverse order: the head is the ones digit. Add the two numbers and return the sum as a list in the same format. Inputs have no leading zeros, except the number 0 itself.

**Example.**

```text
[2,4,3] + [5,6,4] -> [7,0,8]
(342 + 465 = 807)
[9,9] + [1] -> [0,0,1]
(99 + 1 = 100)
```

**Steps.**
1. Create a dummy head and a `tail` pointer. Set `carry = 0`.
2. Loop while `l1 or l2 or carry`.
3. In each iteration, compute `total = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry`. Append a node with `total % 10`. Set `carry = total // 10`. Advance each input pointer that is not `None`.
4. Return `dummy.next`.
5. The reverse order helps. You add from the ones digit upward, the same way carries move, with no reversal step.

**Complexity.** O(max(m, n)) time / O(1) space beyond the output list.

### Merge Two Sorted Lists ★

**Problem.** Merge two ascending lists into one ascending list. Splice the existing nodes together; create no new nodes. Return the merged head.

**Example.**

```text
[1,2,4] + [1,3,4] -> [1,1,2,3,4,4]
[] + [0] -> [0]
```

**Steps.**
1. Create a dummy head. Set `tail = dummy`.
2. While both lists are not `None`, attach the smaller head to `tail.next`. Then advance that list and `tail`. On a tie, take `list1`. Either works, and a consistent choice keeps the merge stable.
3. When one list runs out, attach the other whole: `tail.next = list1 or list2`. It is already in order, so you do not walk it.
4. Return `dummy.next`. The dummy saves you a special case for the list that gives the first node.

**Complexity.** O(m + n) time / O(1) space. You examine every node once and move it at most once.

### Copy List with Random Pointer

**Problem.** Each node has `next` and an extra `random` pointer. `random` targets any node in the list, or `None`. Return a deep copy: new nodes, with `next` and `random` pointing at the copies of the original targets.

**Example.**

```text
[7,13,11], where 13.random -> node 7
and 11.random -> node 13
-> the same structure, all new nodes
```

**Steps.**
1. Dict approach, first pass: create a bare clone `Node(orig.val)` for every node. Store it in a dict keyed by the original node object.
2. Second pass: for each original, set `clone.next = clones.get(orig.next)` and `clone.random = clones.get(orig.random)`. `clones.get(None)` is `None`, so a missing target needs no special case.
3. Return `clones.get(head)`. The dict converts "pointer into the old list" to "pointer into the new list" in O(1).
4. O(1)-space alternative: interleave. Insert each clone right after its original (`A -> A' -> B -> B' -> …`). Set `clone.random = orig.random.next if orig.random else None`, which is the clone of the target. Then separate the two lists in a third pass.

**Complexity.** O(n) time / O(n) space for the dict, or O(1) extra with interleaving.

### Reverse Linked List II ★

**Problem.** Given `head` and 1-indexed positions `left ≤ right`, reverse the nodes from position `left` through `right` in place. Return the head. Use one pass.

**Example.**

```text
[1,2,3,4,5], left 2, right 4
  -> [1,4,3,2,5]
[5], left 1, right 1 -> [5]
```

**Steps.**
1. Create a dummy head, so the window can start at position 1 without a special case.
2. Walk `prev` from the dummy for `left − 1` steps. It lands on the node right before the window.
3. Set `start = prev.next`. This is the window's first node, and it ends up as the last.
4. Repeat `right − left` times. Take the node after `start` and insert it at the front of the window:

   ```python
   move = start.next
   start.next = move.next
   move.next = prev.next
   prev.next = move
   ```
5. Return `dummy.next`. Each iteration moves one node to the front. After `right − left` moves, the window holds the reversed nodes, already spliced in. No separate reconnect step is necessary.

**Complexity.** O(n) time / O(1) space. One walk to `prev`, then one move per window node.

### Reverse Nodes in k-Group

**Problem.** Reverse every consecutive group of `k` nodes. If fewer than `k` nodes remain at the end, keep their original order. Return the head.

**Example.**

```text
[1,2,3,4,5], k = 2 -> [2,1,4,3,5]
[1,2,3,4,5], k = 3 -> [3,2,1,4,5]
```

**Steps.**
1. Use a dummy head. Set `group_prev = dummy`.
2. Probe: walk `k` steps from `group_prev` to find the group's last node (`kth`). If you reach `None` first, fewer than `k` nodes remain. Stop and leave them as they are.
3. Save the boundary `after = kth.next`. Reverse exactly the group with the three-pointer loop, from `group_prev.next` until `curr` reaches `after`.
4. Splice. The group's old first node (`group_prev.next`) is now its last. Save it and point `group_prev.next` at `kth`. Point the saved node at `after`, then advance `group_prev` to the saved node.
5. Repeat from step 2. The probe before the reversal protects the final short group.

**Complexity.** O(n) time / O(1) space. You probe each node once and reverse it once.

### Remove Nth Node From End of List

**Problem.** Remove the nth node from the end, where `n = 1` is the tail. Return the head. `n` is always valid.

**Example.**

```text
[1,2,3,4,5], n = 2 -> [1,2,3,5]
[1], n = 1 -> []
```

**Steps.**
1. Use a dummy head. Start both `slow` and `fast` at the dummy.
2. Advance `fast` by `n + 1` steps. The gap between the pointers is now `n + 1`.
3. Move both one step at a time until `fast` is `None`. `slow` now sits right before the target node.
4. Delete with `slow.next = slow.next.next`. Return `dummy.next`.
5. The dummy and the extra lead step let this delete the head itself (`n` = length) with no special case.

**Complexity.** O(n) time / O(1) space. One pass, two pointers.

### Remove Duplicates from Sorted List II

**Problem.** The list is in ascending order. Delete every node whose value appears more than once. Keep only the values that occur exactly once. Return the head.

**Example.**

```text
[1,2,3,3,4,4,5] -> [1,2,5]
[1,1,1,2,3]     -> [2,3]
```

**Steps.**
1. Use a dummy head. Set `prev = dummy`.
2. Look at `curr = prev.next`. If `curr.next` exists and has the same value, a duplicate run starts here.
3. For a run, advance `curr` while `curr.next is not None and curr.next.val == curr.val`. Then skip the whole run with `prev.next = curr.next`. Do not advance `prev`, because the new node at `prev.next` is not yet proven unique.
4. Otherwise `curr` is unique, so advance `prev = curr`.
5. Loop until `prev.next is None`. Return `dummy.next`.
6. Invariant: `prev` only steps onto nodes proven unique. The order makes duplicates adjacent, so one local check is enough.

**Complexity.** O(n) time / O(1) space. You visit each node at most twice.

### Rotate List

**Problem.** Rotate the list right by `k` places: the last `k` nodes move to the front. `k ≥ 0` and can exceed the list length.

**Example.**

```text
[1,2,3,4,5], k = 2 -> [4,5,1,2,3]
[1,2], k = 3 -> [2,1] (3 % 2 = 1)
```

**Steps.**
1. If the list is empty or has one node, return it unchanged.
2. Walk to the tail and count the length `n`. Normalize with `k %= n`. If `k == 0`, return `head`.
3. Close the loop with `tail.next = head`. The list is circular for a moment.
4. The new tail is `n − k − 1` steps from the old head. Walk there, set `new_head = new_tail.next`, and cut with `new_tail.next = None`.
5. The circular list turns "rotate" into "choose where to cut". That is one decision instead of two splices.

**Complexity.** O(n) time / O(1) space. At most two passes.

### Partition List

**Problem.** Given a value `x`, rearrange the list so every node with `val < x` comes before every node with `val ≥ x`. Keep the original relative order inside each part. Return the head.

**Example.**

```text
[1,4,3,2,5,2], x = 3
  -> [1,2,2,4,3,5]
[2,1], x = 2 -> [1,2]
```

**Steps.**
1. Create two dummy heads, `before_dummy` and `after_dummy`, each with its own tail pointer.
2. Sweep the list once. Append each node to the `before` list if `val < x`, else to the `after` list. Appending nodes in the order you meet them keeps the partition stable for free.
3. End the `after` list with `after_tail.next = None`. Without this, a pointer still leads into the middle of the original list, which usually makes a cycle.
4. Join with `before_tail.next = after_dummy.next`. Return `before_dummy.next`.

**Complexity.** O(n) time / O(1) space. One pass; you move nodes and never copy them.

### LRU Cache

**Problem.** Design a key-value cache with a fixed capacity. `get(key)` returns the value or −1. `put(key, value)` inserts or updates. Both run in O(1) average time, and both count as a use of the key. When a `put` exceeds the capacity, evict the least recently used key.

**Example.**

```text
capacity 2:
put(1,1), put(2,2)
get(1) -> 1
put(3,3)  (evicts key 2)
get(2) -> -1
get(1) -> 1
get(3) -> 3
```

**Steps.**
1. Combine a hash map (key to node) with a doubly linked list in order of recency. The most recent node is at the front, and the eviction victim is at the back.
2. Use head and tail sentinel nodes, so insert-at-front and unlink need no end cases. Each node stores `key`, `value`, `prev` and `next`. The key must live on the node, so an eviction can delete its dict entry.
3. `get`: look up the node. If it is absent, return −1. Otherwise unlink it, insert it at the front to refresh its recency, and return its value.
4. `put`: if the key exists, update the value and move the node to the front. Otherwise insert a new node at the front. If the dict size now exceeds the capacity, unlink the node before the tail sentinel and delete its key from the dict.
5. In Python, `collections.OrderedDict` keeps insertion order. A `move_to_end(key)` on every use, plus `popitem(last=False)` for the LRU key, gives the same O(1) behavior in about twelve lines. Know both, and build the one you can defend.

**Complexity.** O(1) per operation / O(capacity) space.

## Interview follow-ups

- After **Linked List Cycle**: "Where does the cycle start?" Use Floyd phase two. After the meeting, reset one pointer to `head` and advance both one step at a time. They meet at the cycle's entry. The distance from head to entry equals the distance from the meeting point to the entry, modulo the cycle length.
- After **Merge Two Sorted Lists**: "Merge k lists?" Use pairwise divide and conquer (O(N log k)) or a min-heap of the k heads. Both appear in later concepts.
- After **Add Two Numbers**: "Digits stored most significant first?" Reverse both lists first, or push the digits onto two stacks and add from the tops.
- After **Remove Nth From End**: "Do it in exactly one pass, without the length." The two-pointer gap of n already does that; say so.
- After **LRU Cache**: "Make it LFU." Use frequency buckets, each with its own recency list. It is still O(1), but the bookkeeping doubles.

## The task

You write four pointer-surgery functions. Every list node is a `ListNode` with `val` and `next`. `next` is the following node, or `None` at the tail. An empty list is `None`.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

In the examples, `list_from([a, b, c])` is the list `a -> b -> c` built from such nodes. The tests build and read lists the same way.

1. `has_cycle(head)` returns `True` if the list has a cycle, else `False`. In a cycle, following `next` never reaches `None`.
2. Compare nodes by identity. Values can repeat in a list with no cycle.
3. Use O(n) time and O(1) space: fast and slow pointers, not a `set` of visited nodes.
4. `add_two_numbers(l1, l2)` takes two non-empty lists. Each stores a non-negative integer with its digits in reverse order.
5. The head is the ones digit. There are no leading zeros, except the number 0 itself.
6. Return a list that holds the sum in the same reverse-digit format. Use O(max(m, n)) time.
7. `merge_two_lists(list1, list2)` takes two ascending lists. Either one can be `None`.
8. Merge them into one ascending list and return its head. Splice the existing nodes; do not create new ones.
9. Use O(m + n) time and O(1) space. The tests check that every result node came from the inputs.
10. `reverse_between(head, left, right)` reverses the nodes from position `left` through `right`, in place. It returns the head.
11. Positions are 1-indexed, with `1 ≤ left ≤ right ≤ length`. Use one pass, O(n) time and O(1) space.

Edge cases:

- `has_cycle`: an empty list is `False`. A single node with `next = None` is `False`.
- `has_cycle`: a single node that points at itself is `True`. Repeated values with no cycle are `False`.
- `add_two_numbers`: handle lists of different lengths and a final carry that adds a digit.
- `add_two_numbers`: `0 + 0` gives a single zero node, not an empty list.
- `merge_two_lists`: handle one or both lists empty and one list entirely smaller than the other.
- `merge_two_lists`: handle equal values across the two lists and negative values.
- `reverse_between`: `left == right` changes nothing. A window at position 1 changes the head; return the new one.
- `reverse_between`: handle a window that ends at the tail and a full reversal of two nodes.

```python
a, b = ListNode(3), ListNode(2)
c, d = ListNode(0), ListNode(-4)
a.next, b.next, c.next = b, c, d
# The tail loops back to b.
d.next = b
has_cycle(a)                  # True
has_cycle(list_from([1, 2]))  # False
has_cycle(None)               # False

add_two_numbers(list_from([2, 4, 3]),
  list_from([5, 6, 4]))
# list_from([7, 0, 8]): 342 + 465 = 807
add_two_numbers(list_from([0]),
  list_from([0]))
# list_from([0])
add_two_numbers(list_from([9, 9]),
  list_from([1]))
# list_from([0, 0, 1]): 99 + 1 = 100

merge_two_lists(list_from([1, 2, 4]),
  list_from([1, 3, 4]))
# list_from([1, 1, 2, 3, 4, 4])
merge_two_lists(None, None)  # None
merge_two_lists(None,
  list_from([0]))
# list_from([0])

reverse_between(
  list_from([1, 2, 3, 4, 5]), 2, 4)
# list_from([1, 4, 3, 2, 5])
reverse_between(list_from([5]), 1, 1)
# list_from([5])
reverse_between(list_from([1, 2, 3]),
  1, 3)
# list_from([3, 2, 1])
```
