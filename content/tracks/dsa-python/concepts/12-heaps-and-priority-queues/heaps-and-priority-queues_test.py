import sys
from stub import MinHeap, k_largest_elements, merge_k_sorted_lists, ListNode, _make_list, _to_vals

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


# MinHeap
h = MinHeap()
h.push(5); h.push(3); h.push(8)
test("heap: peek after 3 pushes", h.peek() == 3, f"got {h.peek()}")
test("heap: len after 3 pushes", len(h) == 3, f"got {len(h)}")
popped = h.pop()
test("heap: pop returns min", popped == 3, f"got {popped}")
test("heap: peek after pop", h.peek() == 5, f"got {h.peek()}")
test("heap: len after pop", len(h) == 2, f"got {len(h)}")
h2 = MinHeap()
h2.push(1)
test("heap: single element peek", h2.peek() == 1)
test("heap: single element pop", h2.pop() == 1)
test("heap: empty after pop", len(h2) == 0)
h3 = MinHeap()
for v in [10, 4, 15, 1, 7]:
    h3.push(v)
pops = [h3.pop() for _ in range(5)]
test("heap: pops in sorted order", pops == [1, 4, 7, 10, 15], f"got {pops}")

# k_largest_elements
r = sorted(k_largest_elements([3, 2, 1, 5, 6, 4], 2))
test("k_largest: k=2", r == [5, 6], f"got {r}")
r = sorted(k_largest_elements([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))
test("k_largest: k=4 with duplicates", r == [4, 5, 5, 6], f"got {r}")
r = sorted(k_largest_elements([1], 1))
test("k_largest: single element", r == [1], f"got {r}")
r = sorted(k_largest_elements([1, 2, 3, 4, 5], 5))
test("k_largest: k=all elements", r == [1, 2, 3, 4, 5], f"got {r}")
r = sorted(k_largest_elements([-1, -2, -3, -4], 2))
test("k_largest: negative numbers", r == [-2, -1], f"got {r}")

# merge_k_sorted_lists
r = _to_vals(merge_k_sorted_lists([_make_list([1, 4, 5]), _make_list([1, 3, 4]), _make_list([2, 6])]))
test("merge_k: standard 3 lists", r == [1, 1, 2, 3, 4, 4, 5, 6], f"got {r}")
r = _to_vals(merge_k_sorted_lists([]))
test("merge_k: empty list of lists", r == [], f"got {r}")
r = _to_vals(merge_k_sorted_lists([None]))
test("merge_k: single empty list", r == [], f"got {r}")
r = _to_vals(merge_k_sorted_lists([_make_list([1])]))
test("merge_k: single list single element", r == [1], f"got {r}")
r = _to_vals(merge_k_sorted_lists([_make_list([1, 2, 3])]))
test("merge_k: single list", r == [1, 2, 3], f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
