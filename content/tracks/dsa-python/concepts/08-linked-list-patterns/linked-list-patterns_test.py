import sys
from stub import ListNode, reverse_list, has_cycle, merge_two_sorted_lists

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


def make_list(vals: list[int]) -> "ListNode | None":
    if not vals:
        return None
    head = ListNode(vals[0])
    curr = head
    for v in vals[1:]:
        curr.next = ListNode(v)
        curr = curr.next
    return head


def to_vals(head: "ListNode | None", limit: int = 200) -> list[int]:
    vals: list[int] = []
    curr = head
    seen: set[int] = set()
    while curr and id(curr) not in seen and len(vals) < limit:
        seen.add(id(curr))
        vals.append(curr.val)
        curr = curr.next
    return vals


# reverse_list
test("reverse: five elements", to_vals(reverse_list(make_list([1, 2, 3, 4, 5]))) == [5, 4, 3, 2, 1])
test("reverse: two elements", to_vals(reverse_list(make_list([1, 2]))) == [2, 1])
test("reverse: single element", to_vals(reverse_list(make_list([42]))) == [42])
test("reverse: None input", reverse_list(None) is None)
test("reverse: three elements", to_vals(reverse_list(make_list([1, 2, 3]))) == [3, 2, 1])

# has_cycle
test("cycle: no cycle (3 nodes)", has_cycle(make_list([1, 2, 3])) is False)
test("cycle: empty list", has_cycle(None) is False)
test("cycle: single node no cycle", has_cycle(ListNode(1)) is False)

n1 = ListNode(1)
n2 = ListNode(2)
n3 = ListNode(3)
n4 = ListNode(4)
n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2
test("cycle: cycle at node 2", has_cycle(n1) is True)

ns = ListNode(1)
ns.next = ns
test("cycle: self-loop", has_cycle(ns) is True)

# merge_two_sorted_lists
r = to_vals(merge_two_sorted_lists(make_list([1, 2, 4]), make_list([1, 3, 4])))
test("merge: standard", r == [1, 1, 2, 3, 4, 4], f"got {r}")
r = to_vals(merge_two_sorted_lists(None, make_list([0])))
test("merge: empty first list", r == [0], f"got {r}")
r = to_vals(merge_two_sorted_lists(make_list([0]), None))
test("merge: empty second list", r == [0], f"got {r}")
r = to_vals(merge_two_sorted_lists(None, None))
test("merge: both empty", r == [], f"got {r}")
r = to_vals(merge_two_sorted_lists(make_list([1, 3, 5]), make_list([2, 4, 6])))
test("merge: interleaved", r == [1, 2, 3, 4, 5, 6], f"got {r}")
r = to_vals(merge_two_sorted_lists(make_list([1, 2, 3]), make_list([4, 5, 6])))
test("merge: non-overlapping ranges", r == [1, 2, 3, 4, 5, 6], f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
