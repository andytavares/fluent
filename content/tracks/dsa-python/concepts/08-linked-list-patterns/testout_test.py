from stub import ListNode, has_cycle, add_two_numbers, merge_two_lists, reverse_between, list_from, to_list

passed = 0
failed = 0


def test(name: str, condition: bool, detail: str = "") -> None:
    global passed, failed
    if condition:
        print(f"  PASS: {name}")
        passed += 1
    else:
        msg = f" — {detail}" if detail else ""
        print(f"  FAIL: {name}{msg}")
        failed += 1


def node_at(head: ListNode, i: int) -> ListNode:
    node = head
    while i > 0:
        node = node.next
        i -= 1
    return node


# ── has_cycle ──
head = list_from([3, 2, 0, -4])
node_at(head, 3).next = node_at(head, 1)
test("has_cycle: cycle back into the middle", has_cycle(head) is True)

head = list_from([1, 2])
node_at(head, 1).next = head
test("has_cycle: two-node cycle", has_cycle(head) is True)

test("has_cycle: acyclic list", has_cycle(list_from([1, 2])) is False)
test("has_cycle: empty list", has_cycle(None) is False)
test("has_cycle: single node, no cycle", has_cycle(list_from([1])) is False)

node = ListNode(1)
node.next = node
test("has_cycle: single node self-loop", has_cycle(node) is True)

test("has_cycle: repeated values without a cycle (identity, not value)", has_cycle(list_from([1, 1, 1])) is False)

values = [i % 7 for i in range(10000)]
head = list_from(values)
test("has_cycle: long acyclic list", has_cycle(head) is False)

head = list_from(values)
node_at(head, 9999).next = node_at(head, 9990)
test("has_cycle: long list, tiny cycle at the end", has_cycle(head) is True)

# ── add_two_numbers ──
r = to_list(add_two_numbers(list_from([2, 4, 3]), list_from([5, 6, 4])))
test("add_two_numbers: 342 + 465 = 807", r == [7, 0, 8], f"got {r}")

r = to_list(add_two_numbers(list_from([0]), list_from([0])))
test("add_two_numbers: 0 + 0 = 0", r == [0], f"got {r}")

r = to_list(add_two_numbers(list_from([9, 9]), list_from([1])))
test("add_two_numbers: final carry adds a digit (99 + 1)", r == [0, 0, 1], f"got {r}")

r = to_list(add_two_numbers(list_from([9, 9, 9, 9, 9, 9, 9]), list_from([9, 9, 9, 9])))
test("add_two_numbers: carry chain across many digits", r == [8, 9, 9, 9, 0, 0, 0, 1], f"got {r}")

r = to_list(add_two_numbers(list_from([1, 2]), list_from([3, 4])))
test("add_two_numbers: no carry at all", r == [4, 6], f"got {r}")

r = to_list(add_two_numbers(list_from([5]), list_from([5])))
test("add_two_numbers: single digits with carry (5 + 5)", r == [0, 1], f"got {r}")

nines = [9] * 1000
r = to_list(add_two_numbers(list_from(nines), list_from([1])))
expected = [0] * 1000 + [1]
test("add_two_numbers: 1000-digit number plus 1 (carry ripples end to end)", r == expected)

# ── merge_two_lists ──
r = to_list(merge_two_lists(list_from([1, 2, 4]), list_from([1, 3, 4])))
test("merge_two_lists: classic interleave", r == [1, 1, 2, 3, 4, 4], f"got {r}")

test("merge_two_lists: both empty", merge_two_lists(None, None) is None)
test("merge_two_lists: first empty", to_list(merge_two_lists(None, list_from([0]))) == [0])
test("merge_two_lists: second empty", to_list(merge_two_lists(list_from([7]), None)) == [7])

r = to_list(merge_two_lists(list_from([1, 2, 3]), list_from([4, 5, 6])))
test("merge_two_lists: disjoint ranges", r == [1, 2, 3, 4, 5, 6], f"got {r}")

r = to_list(merge_two_lists(list_from([-3, 0, 0, 5]), list_from([-3, 2])))
test("merge_two_lists: negatives and duplicates", r == [-3, -3, 0, 0, 2, 5], f"got {r}")

l1 = list_from([1, 3, 5])
l2 = list_from([2, 4])
input_nodes = set()
n = l1
while n is not None:
    input_nodes.add(id(n))
    n = n.next
n = l2
while n is not None:
    input_nodes.add(id(n))
    n = n.next
merged = merge_two_lists(l1, l2)
ok = to_list(merged) == [1, 2, 3, 4, 5]
n = merged
while n is not None:
    ok = ok and id(n) in input_nodes
    n = n.next
test("merge_two_lists: splices existing nodes, no new allocations", ok)

evens = [2 * i for i in range(5000)]
odds = [2 * i + 1 for i in range(5000)]
r = to_list(merge_two_lists(list_from(evens), list_from(odds)))
expected = list(range(10000))
test("merge_two_lists: two 5000-node lists", r == expected)

# ── reverse_between ──
r = to_list(reverse_between(list_from([1, 2, 3, 4, 5]), 2, 4))
test("reverse_between: middle window", r == [1, 4, 3, 2, 5], f"got {r}")

r = to_list(reverse_between(list_from([5]), 1, 1))
test("reverse_between: single node, left == right", r == [5], f"got {r}")

r = to_list(reverse_between(list_from([1, 2, 3]), 1, 3))
test("reverse_between: whole list", r == [3, 2, 1], f"got {r}")

r = to_list(reverse_between(list_from([1, 2, 3, 4]), 1, 2))
test("reverse_between: window starts at the head", r == [2, 1, 3, 4], f"got {r}")

r = to_list(reverse_between(list_from([1, 2, 3, 4]), 3, 4))
test("reverse_between: window ends at the tail", r == [1, 2, 4, 3], f"got {r}")

r = to_list(reverse_between(list_from([1, 2, 3]), 2, 2))
test("reverse_between: left == right in the middle is a no-op", r == [1, 2, 3], f"got {r}")

r = to_list(reverse_between(list_from([3, 5]), 1, 2))
test("reverse_between: two-node full reversal", r == [5, 3], f"got {r}")

values = list(range(5000))
r = to_list(reverse_between(list_from(values), 1001, 4000))
expected = values[:1000] + list(reversed(values[1000:4000])) + values[4000:]
test("reverse_between: large window inside a 5000-node list", r == expected)

values = list(range(5000))
r = to_list(reverse_between(list_from(values), 1, 5000))
test("reverse_between: full reversal of a 5000-node list", r == list(reversed(values)))

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
