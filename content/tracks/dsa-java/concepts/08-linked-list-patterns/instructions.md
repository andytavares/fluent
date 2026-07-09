# Linked List

## What you'll learn

Pointer surgery on singly linked lists: the dummy-head sentinel that erases every "what if the head changes?" special case, fast/slow pointers (Floyd's cycle detection and the gap-of-n trick), in-place reversal of a window, and list splicing. The same four moves solve everything in this group, from Merge Two Sorted Lists up to LRU Cache — the hash-map-plus-doubly-linked-list design that shows up in real caches as often as in interviews.

## Key concepts

### The node representation

Every list node here is an instance of a small class with a value and a pointer to the next node; the tail's `next` is `null`. Define it as a `static` nested class inside `Solution` so it's usable without an outer-class instance:

```java
static class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

// 1 -> 2 -> 3
ListNode head = new ListNode(1, new ListNode(2, new ListNode(3, null)));
```

An empty list is just `null`. Walking a list is `while (node != null) node = node.next`, and every "delete" or "insert" is a pointer reassignment, never an array shift.

### The dummy head (sentinel)

Any operation that might replace or remove the first node — merging, deleting, partitioning — gets dramatically simpler with a throwaway node in front:

```java
ListNode dummy = new ListNode(0, head);
ListNode tail = dummy;
// ... build or patch the list through tail.next ...
return dummy.next; // the real head, whatever it turned out to be
```

Without the sentinel you write "if the node to delete is the head..." branches everywhere. With it, the head is just another `next` pointer, handled by the same code as every other node.

### Fast/slow pointers

Advance `fast` two steps for every one step of `slow`:

```java
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true; // cycle — they met
}
return false; // fast fell off the end — no cycle
```

If the list has a cycle, both pointers eventually orbit inside it, and each step shrinks the gap between them by exactly one — so they must collide. If there's no cycle, `fast` hits `null` within n/2 steps. The same skeleton with different offsets finds the middle of a list (`slow` is at the middle when `fast` reaches the end) and the nth node from the end (give `fast` a head start of n).

Compare nodes by **identity** (`slow == fast` — Java's `==` on object references compares identity, exactly what's needed here), never by value — values can repeat freely. This is one of the rare cases where Java's default reference-`==` is exactly the tool you want, unlike `Integer`/`String` comparisons elsewhere where you'd need `.equals()`.

### In-place reversal

The three-pointer loop that reverses a list without allocating:

```java
ListNode prev = null, curr = head;
while (curr != null) {
    ListNode next = curr.next; // save before overwriting!
    curr.next = prev;          // flip the pointer
    prev = curr;
    curr = next;
}
// prev is the new head
```

Reverse Linked List II runs this idea over a window `[left, right]` and then re-splices: the node before the window points at the window's new head, and the window's old head (now its tail) points at whatever follows.

### Splicing

Cutting a list and reconnecting the pieces. Rotate List: find the new tail, cut there, reattach the old tail to the old head. Partition List: build two lists under two dummy heads, then join them — and remember to `null`-terminate the second one, or you've built an accidental cycle.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Linked List Cycle | O(n) | O(1) | Floyd fast/slow |
| Add Two Numbers | O(max(m, n)) | O(1) extra | dummy head + carry |
| Merge Two Sorted Lists | O(m + n) | O(1) | dummy head + splice |
| Reverse Linked List II | O(n) | O(1) | window reversal + splice |

## Watch out

- **Save `curr.next` before overwriting it.** Dropping the rest of the list is the single most common reversal bug — once `curr.next = prev` runs, the old tail is unreachable unless you stashed it.
- **Return `dummy.next`, not `head`.** After a merge or delete, `head` may no longer be the first node. The sentinel exists precisely so you don't have to know.
- **Guard both `fast` and `fast.next`** in the Floyd loop. Without the double check, `fast.next.next` throws `NullPointerException` on even-length lists.
- **Node identity (`==`), not value equality.** `hasCycle` on `1 → 1 → 1 → null` must return `false`; comparing `.val` fields would lie.
- **Add Two Numbers: the final carry.** `5 + 5` is `[0, 1]`, not `[0]` — loop `while (l1 != null || l2 != null || carry != 0)`.
- **`reverseBetween` is 1-indexed**, and `left == right` must be a no-op, not an off-by-one crash.
- **LRU Cache: a `get` is also a use.** Forgetting to refresh recency on reads (not just writes) is the classic failure mode — the cache silently evicts hot keys.

## Problem walkthroughs

### Linked List Cycle ★

**Problem.** Given the head of a singly linked list, return `true` if the list contains a cycle — some node's `next` points back to an earlier node — and `false` if it terminates in `null`. Use O(1) space.

**Example.**

    3 → 2 → 0 → −4, with −4.next pointing back at the node 2 → true
    1 → 2 → null                                              → false

**Steps.**
1. Set `slow = head`, `fast = head`.
2. Loop while `fast != null && fast.next != null`: move `slow` one step, `fast` two.
3. After moving, if `slow == fast` (identity comparison), return `true`.
4. If the loop exits, `fast` walked off the end — return `false`.
5. Why they must meet: once both pointers are inside the cycle, `fast` gains one node per step on `slow`, so the gap hits zero within one lap. The O(n)-space alternative — a `HashSet` of visited nodes — works but concedes the follow-up.

**Complexity.** O(n) time / O(1) space — `slow` never completes a second lap.

### Add Two Numbers ★

**Problem.** Two non-empty lists represent non-negative integers with digits stored in **reverse order** — the head is the ones digit. Add the two numbers and return the sum as a list in the same format. Inputs have no leading zeros, except the number 0 itself.

**Example.**

    [2,4,3] + [5,6,4] → [7,0,8]     (342 + 465 = 807)
    [9,9] + [1]       → [0,0,1]     (99 + 1 = 100)

**Steps.**
1. Create a dummy head and a `tail` pointer; set `carry = 0`.
2. Loop while `l1 != null || l2 != null || carry != 0`.
3. Each iteration: `sum = (l1 != null ? l1.val : 0) + (l2 != null ? l2.val : 0) + carry`; append a node with `sum % 10`; set `carry = sum / 10`; advance whichever input pointers are non-null.
4. Return `dummy.next`.
5. The reverse-order storage is a gift: you add from the ones digit upward, exactly the way carries propagate, with no reversal step needed.

**Complexity.** O(max(m, n)) time / O(1) space beyond the output list.

### Merge Two Sorted Lists ★

**Problem.** Merge two sorted (ascending) lists into one sorted list by **splicing the existing nodes together** — no new nodes. Return the merged head.

**Example.**

    [1,2,4] + [1,3,4] → [1,1,2,3,4,4]
    [] + [0]          → [0]

**Steps.**
1. Create a dummy head; `tail = dummy`.
2. While both lists are non-null: attach the smaller head to `tail.next`, then advance that list and `tail`. Take `list1` on ties (either works; being consistent keeps the merge stable).
3. When one list runs out, attach the survivor whole: `tail.next = list1 != null ? list1 : list2`. It's already sorted — no need to walk it.
4. Return `dummy.next`. The dummy is what saves you from special-casing which list contributes the first node.

**Complexity.** O(m + n) time / O(1) space — every node is examined once and moved at most once.

### Copy List with Random Pointer

**Problem.** Each node carries `next` plus an extra `random` pointer that targets any node in the list, or `null`. Return a deep copy: brand-new nodes, with `next` and `random` wired to the *copies* of whatever the originals pointed at.

**Example.**

    [7,13,11] where 13.random → the node 7, 11.random → the node 13
    → a structurally identical list built entirely of new nodes

**Steps.**
1. Map approach — first pass: create a bare clone (val only, `next`/`random` both `null`) for every node and store it in a `Map<Node, Node>` keyed by the original node.
2. Second pass: for each original, set `clone.next = map.get(orig.next)` and `clone.random = map.get(orig.random)` (`map.get(null)` is `null` already in Java — no normalization needed, unlike languages where a missing key returns `undefined`).
3. Return `map.get(head)`. The map converts "pointer into the old list" to "pointer into the new list" in O(1).
4. O(1)-space alternative: interleave — insert each clone right after its original (`A → A' → B → B' → …`), set `clone.random = orig.random != null ? orig.random.next : null` (the clone of the target), then unweave the two lists in a third pass.

**Complexity.** O(n) time / O(n) space for the map (O(1) extra with interleaving).

### Reverse Linked List II ★

**Problem.** Given `head` and 1-indexed positions `left <= right`, reverse the nodes from position `left` through `right` in place and return the head. One pass.

**Example.**

    [1,2,3,4,5], left = 2, right = 4 → [1,4,3,2,5]
    [5], left = 1, right = 1         → [5]

**Steps.**
1. Create a dummy head so the window can start at position 1 without a special case.
2. Walk `prev` from the dummy `left - 1` steps — it lands on the node just before the window.
3. Set `start = prev.next` (the window's first node, which will end up as its last).
4. Repeat `right - left` times — take the node after `start` and front-insert it at the window's head:
   `ListNode move = start.next; start.next = move.next; move.next = prev.next; prev.next = move;`
5. Return `dummy.next`. Each iteration front-inserts one node, so after `right - left` moves the window is fully reversed *and already spliced* — no separate reconnect step.

**Complexity.** O(n) time / O(1) space — one walk to `prev`, then one move per window node.

### Reverse Nodes in k-Group

**Problem.** Reverse every consecutive group of `k` nodes. If fewer than `k` nodes remain at the end, leave them in their original order. Return the head.

**Example.**

    [1,2,3,4,5], k = 2 → [2,1,4,3,5]
    [1,2,3,4,5], k = 3 → [3,2,1,4,5]

**Steps.**
1. Use a dummy head; `groupPrev = dummy`.
2. Probe: walk `k` steps from `groupPrev` to find the group's last node (`kth`). If you hit `null` first, fewer than `k` nodes remain — stop, leaving them untouched.
3. Save the boundary `after = kth.next`, then reverse exactly the group with the standard three-pointer loop, running `curr` from `groupPrev.next` until it reaches `after`.
4. Splice: the group's old first node (`groupPrev.next`) is now its last. Save it, point `groupPrev.next` at `kth`, point the saved node at `after`, then advance `groupPrev` to the saved node.
5. Repeat from step 2. Probing *before* reversing is what protects the final short group.

**Complexity.** O(n) time / O(1) space — each node is probed once and reversed once.

### Remove Nth Node From End of List

**Problem.** Remove the nth node counting from the end (`n = 1` is the tail) and return the head. `n` is always valid.

**Example.**

    [1,2,3,4,5], n = 2 → [1,2,3,5]
    [1], n = 1         → []

**Steps.**
1. Dummy head; start both `slow` and `fast` at the dummy.
2. Advance `fast` by `n + 1` steps, creating a gap of `n + 1` between the pointers.
3. Move both one step at a time until `fast` is `null`. Now `slow` sits just **before** the target node.
4. Delete with `slow.next = slow.next.next`; return `dummy.next`.
5. The dummy plus the extra lead step is what lets this delete the head itself (`n` = length) with no special case.

**Complexity.** O(n) time / O(1) space — one pass, two pointers.

### Remove Duplicates from Sorted List II

**Problem.** The list is sorted ascending. Delete **every** node whose value appears more than once, keeping only the values that occur exactly once. Return the head.

**Example.**

    [1,2,3,3,4,4,5] → [1,2,5]
    [1,1,1,2,3]     → [2,3]

**Steps.**
1. Dummy head; `prev = dummy`.
2. Look at `curr = prev.next`. If `curr.next` exists and shares its value, a duplicate run starts here: advance `curr` while `curr.next != null && curr.next.val == curr.val`, then bypass the entire run with `prev.next = curr.next` — and **do not advance `prev`**, because the node now at `prev.next` is itself unverified.
3. Otherwise `curr` is unique — advance `prev = curr`.
4. Loop until `prev.next == null`; return `dummy.next`.
5. Invariant: `prev` only ever steps onto nodes proven unique. Sorted order is what makes "duplicates are adjacent" true, so one local check suffices.

**Complexity.** O(n) time / O(1) space — each node is visited at most twice.

### Rotate List

**Problem.** Rotate the list right by `k` places: the last `k` nodes move to the front. `k >= 0` and may exceed the list length.

**Example.**

    [1,2,3,4,5], k = 2 → [4,5,1,2,3]
    [1,2], k = 3       → [2,1]        (3 % 2 = 1)

**Steps.**
1. If the list is empty or has one node, return it unchanged.
2. Walk to the tail, counting the length `n`; normalize `k %= n`. If `k == 0`, return `head`.
3. Close the loop: `tail.next = head` — the list is momentarily circular.
4. The new tail sits `n - k - 1` steps from the old head; walk there, set `newHead = newTail.next`, and cut with `newTail.next = null`.
5. Making the list circular first turns "rotate" into "choose where to cut" — one decision instead of two splices.

**Complexity.** O(n) time / O(1) space — at most two passes.

### Partition List

**Problem.** Given a value `x`, rearrange the list so every node with `val < x` comes before every node with `val >= x`, **preserving the original relative order** inside each part. Return the head.

**Example.**

    [1,4,3,2,5,2], x = 3 → [1,2,2,4,3,5]
    [2,1], x = 2         → [1,2]

**Steps.**
1. Two dummy heads — `beforeDummy` and `afterDummy` — each with its own tail pointer.
2. Sweep the list once, appending each node to the `before` list if `val < x`, else to the `after` list. Appending existing nodes in encounter order makes the partition stable for free.
3. Terminate the `after` list: `afterTail.next = null`. Skipping this leaves a pointer dangling into the middle of the original list — usually a cycle.
4. Join: `beforeTail.next = afterDummy.next`; return `beforeDummy.next`.

**Complexity.** O(n) time / O(1) space — one pass; nodes are moved, never copied.

### LRU Cache

**Problem.** Design a fixed-capacity key→value cache. `get(key)` returns the value or −1; `put(key, value)` inserts or updates. Both must run in O(1) average time, and both count as a "use" of the key. When a `put` pushes the cache over capacity, evict the least-recently-used key first.

**Example.**

    capacity 2: put(1,1), put(2,2), get(1) → 1, put(3,3)   — evicts key 2
    get(2) → −1, get(1) → 1, get(3) → 3

**Steps.**
1. Combine a `HashMap<Integer, Node>` with a **doubly** linked list ordered by recency: most-recent at the front, eviction victim at the back.
2. Use head and tail sentinel nodes so insert-at-front and unlink never special-case the ends. Each node stores `key, value, prev, next` — the key must live on the node so eviction can delete its map entry.
3. `get`: look up the node; if absent return −1; otherwise unlink it, re-insert at the front (the recency refresh), and return its value.
4. `put`: if the key exists, update the value and move the node to the front. Otherwise insert a new node at the front; if the map size now exceeds capacity, unlink the node just before the tail sentinel and delete its key from the map.
5. Java's `LinkedHashMap` with `accessOrder = true` implements this exact policy in a few lines via `removeEldestEntry` — worth knowing as the standard-library shortcut, but implement the map + doubly linked list by hand for the interview.

**Complexity.** O(1) per operation / O(capacity) space.

## Interview follow-ups

- After **Linked List Cycle**: "Where does the cycle start?" — Floyd phase two: after the meeting, reset one pointer to `head` and advance both one step at a time; they meet at the cycle's entry (the head-to-entry distance equals the meeting-point-to-entry distance modulo the cycle length).
- After **Merge Two Sorted Lists**: "Merge k lists?" — pairwise divide-and-conquer (O(N log k)) or a min-heap of the k heads; both appear in later concepts.
- After **Add Two Numbers**: "Digits stored most-significant first?" — reverse both lists first, or push the digits onto two stacks and add from the tops.
- After **Remove Nth From End**: "Do it in exactly one pass, without counting the length." — that's precisely what the gap-of-n two-pointer already does; be ready to say so.
- After **LRU Cache**: "Make it LFU." — frequency buckets, each holding its own recency list; still O(1), but the bookkeeping doubles.

## The task

Four pointer-surgery classics. Every list node is an instance of a nested static class:

```java
static class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
```

`next` is the following node or `null` at the tail; an empty list is `null` itself.

### `hasCycle(ListNode head)`

Return `true` if the list contains a cycle (following `next` forever never reaches `null`), else `false`. Compare nodes by identity (`==`) — values may repeat in a perfectly acyclic list. O(n) time and O(1) space: fast/slow pointers, not a `HashSet` of visited nodes.

```java
ListNode a = new ListNode(3), b = new ListNode(2);
ListNode c = new ListNode(0), d = new ListNode(-4);
a.next = b; b.next = c; c.next = d; d.next = b; // tail loops back to b
Solution.hasCycle(a);          // true

Solution.hasCycle(list(1, 2)); // false
Solution.hasCycle(null);       // false
```

Edge cases: empty list (`false`), single node with `next == null` (`false`), single node pointing at itself (`true`), repeated values without a cycle (`false`).

### `addTwoNumbers(ListNode l1, ListNode l2)`

`l1` and `l2` are non-empty lists storing non-negative integers with digits in **reverse order** (the head is the ones digit), with no leading zeros except the number 0 itself. Return a list holding their sum in the same reverse-digit format. O(max(m, n)) time.

```java
Solution.addTwoNumbers(list(2, 4, 3), list(5, 6, 4)); // list(7, 0, 8)  — 342 + 465 = 807
Solution.addTwoNumbers(list(0), list(0));             // list(0)
Solution.addTwoNumbers(list(9, 9), list(1));          // list(0, 0, 1)  — 99 + 1 = 100
```

Edge cases: lists of different lengths, a final carry that adds an extra digit, `0 + 0` (a single zero node, not an empty list).

### `mergeTwoLists(ListNode list1, ListNode list2)`

Both lists are sorted ascending; either may be `null`. Merge them into one sorted list by **splicing the existing nodes** — do not allocate new nodes — and return the merged head. O(m + n) time, O(1) space.

```java
Solution.mergeTwoLists(list(1, 2, 4), list(1, 3, 4)); // list(1, 1, 2, 3, 4, 4)
Solution.mergeTwoLists(null, null);                   // null
Solution.mergeTwoLists(null, list(0));                // list(0)
```

Edge cases: one or both lists empty, all of one list smaller than all of the other, equal values across the two lists, negative values. The tests verify that every node in the result came from the inputs.

### `reverseBetween(ListNode head, int left, int right)`

Reverse the nodes from position `left` through position `right` (**1-indexed**, `1 <= left <= right <= length`) in place, and return the head of the list. One pass, O(n) time, O(1) space.

```java
Solution.reverseBetween(list(1, 2, 3, 4, 5), 2, 4); // list(1, 4, 3, 2, 5)
Solution.reverseBetween(list(5), 1, 1);             // list(5)
Solution.reverseBetween(list(1, 2, 3), 1, 3);       // list(3, 2, 1)
```

Edge cases: `left == right` (no-op), a window starting at position 1 (the head changes — return the new one), a window ending at the tail, a two-node full reversal.
