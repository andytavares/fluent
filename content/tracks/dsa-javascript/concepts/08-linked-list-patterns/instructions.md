## What you build

You write four pointer-surgery functions on singly linked lists: `hasCycle`, `addTwoNumbers`, `mergeTwoLists` and `reverseBetween`. Four moves solve this whole group: the dummy head, fast and slow pointers, in-place reversal and splicing. They reach up to LRU Cache, a hash-map-plus-linked-list design used in real caches. This lesson builds on **Stack**.

## Key concepts

### A node is a plain object with `val` and `next`

Every list node here is a plain object with a value and a pointer to the next node. The tail's `next` is `null`.

```js
// 1 -> 2 -> 3
const head = { val: 1, next:
  { val: 2, next:
    { val: 3, next: null } } };
```

An empty list is `null`. There is no wrapper class. A walk is `while (node !== null) node = node.next`. Every delete or insert is a pointer change, never an array shift.

### A dummy head removes the head special case

Some operations can replace or remove the first node, such as merge, delete and partition. A throwaway node in front makes them much simpler.

```js
const dummy = { val: 0, next: head };
let tail = dummy;
// Build or patch the list through
// tail.next.
// Return the real head, whatever it is.
return dummy.next;
```

Without the sentinel, you write "if the node to delete is the head" branches everywhere. With it, the head is one more `next` pointer, and the same code handles it.

### Fast and slow pointers

Advance `fast` two steps for every one step of `slow`.

```js
let slow = head, fast = head;
while (fast !== null &&
       fast.next !== null) {
  slow = slow.next;
  fast = fast.next.next;
  // Cycle: they met.
  if (slow === fast) return true;
}
// fast fell off the end: no cycle.
return false;
```

In a cycle, both pointers end up inside it. Each step shrinks the gap between them by exactly one, so they must meet. Without a cycle, `fast` reaches `null` within n/2 steps.

The same skeleton with other offsets finds the middle node: `slow` is at the middle when `fast` reaches the end. It also finds the nth node from the end: give `fast` a head start of n.

Compare nodes by identity (`slow === fast` on node references), never by value. Values can repeat.

### In-place reversal uses three pointers

This loop reverses a list without allocation.

```js
let prev = null, curr = head;
while (curr !== null) {
  // Save next before you overwrite it.
  const next = curr.next;
  // Flip the pointer.
  curr.next = prev;
  prev = curr;
  curr = next;
}
// prev is the new head.
```

Reverse Linked List II applies this idea to a window `[left, right]`, then splices the window back in. The node before the window points at the window's new head. The window's old head, now its tail, points at the node after the window.

### Splicing cuts and reconnects a list

Rotate List finds the new tail, cuts there and attaches the old tail to the old head. Partition List builds two lists under two dummy heads, then joins them. Set the second list's last `next` to `null`, or you build an accidental cycle.

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
- Check both `fast` and `fast.next` in the Floyd loop. Otherwise `fast.next.next` throws on even-length lists.
- Compare node identity, not values. `hasCycle` on `1 -> 1 -> 1 -> null` must return `false`.
- In Add Two Numbers, keep the final carry. `5 + 5` is `[0, 1]`, not `[0]`. Loop `while (l1 || l2 || carry)`.
- `reverseBetween` positions are 1-indexed. `left === right` must change nothing and must not crash.
- In LRU Cache, a `get` is also a use. If reads do not refresh recency, the cache evicts hot keys.

## Problem walkthroughs

### Linked List Cycle ★

**Problem.** Given the head of a singly linked list, return `true` if the list has a cycle. In a cycle, some node's `next` points back to an earlier node. Return `false` if the list ends in `null`. Use O(1) space.

**Example.**

```text
3 -> 2 -> 0 -> -4, and -4.next
points back at node 2 -> true
1 -> 2 -> null -> false
```

**Steps.**
1. Set `slow = head` and `fast = head`.
2. Loop while `fast !== null && fast.next !== null`. Move `slow` one step and `fast` two.
3. After the move, if `slow === fast` (identity comparison), return `true`.
4. If the loop ends, `fast` walked off the end, so return `false`.
5. They must meet. Inside the cycle, `fast` gains one node per step on `slow`, so the gap reaches zero within one lap. A `Set` of visited nodes also works, but it uses O(n) space and fails the follow-up.

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
2. Loop while `l1 !== null || l2 !== null || carry !== 0`.
3. In each iteration, compute `sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry`. Append a node with `sum % 10`. Set `carry = Math.floor(sum / 10)`. Advance each input pointer that is not null.
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
2. While both lists are not null, attach the smaller head to `tail.next`. Then advance that list and `tail`. On a tie, take `list1`. Either works, and a consistent choice keeps the merge stable.
3. When one list runs out, attach the other whole: `tail.next = list1 ?? list2`. It is already in order, so you do not walk it.
4. Return `dummy.next`. The dummy saves you a special case for the list that gives the first node.

**Complexity.** O(m + n) time / O(1) space. You examine every node once and move it at most once.

### Copy List with Random Pointer

**Problem.** Each node has `next` and an extra `random` pointer. `random` targets any node in the list, or `null`. Return a deep copy: new nodes, with `next` and `random` pointing at the copies of the original targets.

**Example.**

```text
[7,13,11], where 13.random -> node 7
and 11.random -> node 13
-> the same structure, all new nodes
```

**Steps.**
1. Map approach, first pass: create a bare clone `{ val, next: null, random: null }` for every node. Store it in a `Map` keyed by the original node object.
2. Second pass: for each original, set `clone.next = map.get(orig.next)` and `clone.random = map.get(orig.random)`. `map.get(null)` is `undefined`, so convert it to `null`.
3. Return `map.get(head)`. The map converts "pointer into the old list" to "pointer into the new list" in O(1).
4. O(1)-space alternative: interleave. Insert each clone right after its original (`A -> A' -> B -> B' -> …`). Set `clone.random = orig.random ? orig.random.next : null`, which is the clone of the target. Then separate the two lists in a third pass.

**Complexity.** O(n) time / O(n) space for the map, or O(1) extra with interleaving.

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

   ```js
   const move = start.next;
   start.next = move.next;
   move.next = prev.next;
   prev.next = move;
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
1. Use a dummy head. Set `groupPrev = dummy`.
2. Probe: walk `k` steps from `groupPrev` to find the group's last node (`kth`). If you reach `null` first, fewer than `k` nodes remain. Stop and leave them as they are.
3. Save the boundary `after = kth.next`. Reverse exactly the group with the three-pointer loop, from `groupPrev.next` until `curr` reaches `after`.
4. Splice. The group's old first node (`groupPrev.next`) is now its last. Save it and point `groupPrev.next` at `kth`. Point the saved node at `after`, then advance `groupPrev` to the saved node.
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
3. Move both one step at a time until `fast` is `null`. `slow` now sits right before the target node.
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
3. For a run, advance `curr` while `curr.next !== null && curr.next.val === curr.val`. Then skip the whole run with `prev.next = curr.next`. Do not advance `prev`, because the new node at `prev.next` is not yet proven unique.
4. Otherwise `curr` is unique, so advance `prev = curr`.
5. Loop until `prev.next === null`. Return `dummy.next`.
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
2. Walk to the tail and count the length `n`. Normalize with `k %= n`. If `k === 0`, return `head`.
3. Close the loop with `tail.next = head`. The list is circular for a moment.
4. The new tail is `n − k − 1` steps from the old head. Walk there, set `newHead = newTail.next`, and cut with `newTail.next = null`.
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
1. Create two dummy heads, `beforeDummy` and `afterDummy`, each with its own tail pointer.
2. Sweep the list once. Append each node to the `before` list if `val < x`, else to the `after` list. Appending nodes in the order you meet them keeps the partition stable for free.
3. End the `after` list with `afterTail.next = null`. Without this, a pointer still leads into the middle of the original list, which usually makes a cycle.
4. Join with `beforeTail.next = afterDummy.next`. Return `beforeDummy.next`.

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
2. Use head and tail sentinel nodes, so insert-at-front and unlink need no end cases. Each node stores `{ key, value, prev, next }`. The key must live on the node, so an eviction can delete its map entry.
3. `get`: look up the node. If it is absent, return −1. Otherwise unlink it, insert it at the front to refresh its recency, and return its value.
4. `put`: if the key exists, update the value and move the node to the front. Otherwise insert a new node at the front. If the map size now exceeds the capacity, unlink the node before the tail sentinel and delete its key from the map.
5. In JavaScript, `Map` keeps insertion order. A `delete` and a new `set` on every use, plus `map.keys().next().value` for the LRU key, gives the same O(1) behavior in about twelve lines. Know both, and build the one you can defend.

**Complexity.** O(1) per operation / O(capacity) space.

## Interview follow-ups

- After **Linked List Cycle**: "Where does the cycle start?" Use Floyd phase two. After the meeting, reset one pointer to `head` and advance both one step at a time. They meet at the cycle's entry. The distance from head to entry equals the distance from the meeting point to the entry, modulo the cycle length.
- After **Merge Two Sorted Lists**: "Merge k lists?" Use pairwise divide and conquer (O(N log k)) or a min-heap of the k heads. Both appear in later concepts.
- After **Add Two Numbers**: "Digits stored most significant first?" Reverse both lists first, or push the digits onto two stacks and add from the tops.
- After **Remove Nth From End**: "Do it in exactly one pass, without the length." The two-pointer gap of n already does that; say so.
- After **LRU Cache**: "Make it LFU." Use frequency buckets, each with its own recency list. It is still O(1), but the bookkeeping doubles.

## The task

You write four pointer-surgery functions. Every list node is a plain object `{ val, next }`. `next` is the following node, or `null` at the tail. An empty list is `null`.

```js
// The list 1 -> 2 -> 3:
{ val: 1, next: { val: 2, next:
  { val: 3, next: null } } }
```

In the examples, `list(a, b, c)` is the list `a -> b -> c` built from such nodes. The tests build and read lists the same way.

1. `hasCycle(head)` returns `true` if the list has a cycle, else `false`. In a cycle, following `next` never reaches `null`.
2. Compare nodes by identity. Values can repeat in a list with no cycle.
3. Use O(n) time and O(1) space: fast and slow pointers, not a `Set` of visited nodes.
4. `addTwoNumbers(l1, l2)` takes two non-empty lists. Each stores a non-negative integer with its digits in reverse order.
5. The head is the ones digit. There are no leading zeros, except the number 0 itself.
6. Return a list that holds the sum in the same reverse-digit format. Use O(max(m, n)) time.
7. `mergeTwoLists(list1, list2)` takes two ascending lists. Either one can be `null`.
8. Merge them into one ascending list and return its head. Splice the existing nodes; do not create new ones.
9. Use O(m + n) time and O(1) space. The tests check that every result node came from the inputs.
10. `reverseBetween(head, left, right)` reverses the nodes from position `left` through `right`, in place. It returns the head.
11. Positions are 1-indexed, with `1 ≤ left ≤ right ≤ length`. Use one pass, O(n) time and O(1) space.

Edge cases:

- `hasCycle`: an empty list is `false`. A single node with `next: null` is `false`.
- `hasCycle`: a single node that points at itself is `true`. Repeated values with no cycle are `false`.
- `addTwoNumbers`: handle lists of different lengths and a final carry that adds a digit.
- `addTwoNumbers`: `0 + 0` gives a single zero node, not an empty list.
- `mergeTwoLists`: handle one or both lists empty and one list entirely smaller than the other.
- `mergeTwoLists`: handle equal values across the two lists and negative values.
- `reverseBetween`: `left === right` changes nothing. A window at position 1 changes the head; return the new one.
- `reverseBetween`: handle a window that ends at the tail and a full reversal of two nodes.

```js
const a = { val: 3, next: null };
const b = { val: 2, next: null };
const c = { val: 0, next: null };
const d = { val: -4, next: null };
a.next = b; b.next = c; c.next = d;
// The tail loops back to b.
d.next = b;
hasCycle(a);           // true
hasCycle(list(1, 2));  // false
hasCycle(null);        // false

addTwoNumbers(list(2, 4, 3),
  list(5, 6, 4));
// list(7, 0, 8): 342 + 465 = 807
addTwoNumbers(list(0), list(0));
// list(0)
addTwoNumbers(list(9, 9), list(1));
// list(0, 0, 1): 99 + 1 = 100

mergeTwoLists(list(1, 2, 4),
  list(1, 3, 4));
// list(1, 1, 2, 3, 4, 4)
mergeTwoLists(null, null);     // null
mergeTwoLists(null, list(0));  // list(0)

reverseBetween(list(1, 2, 3, 4, 5), 2, 4);
// list(1, 4, 3, 2, 5)
reverseBetween(list(5), 1, 1);
// list(5)
reverseBetween(list(1, 2, 3), 1, 3);
// list(3, 2, 1)
```
