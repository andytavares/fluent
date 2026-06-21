import sys
from stub import binary_search, search_insert_position, find_min_in_rotated_array

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


# binary_search
r = binary_search([1, 3, 5, 7, 9], 5)
test("bs: found middle", r == 2, f"got {r}")
r = binary_search([1, 3, 5, 7, 9], 1)
test("bs: found first", r == 0, f"got {r}")
r = binary_search([1, 3, 5, 7, 9], 9)
test("bs: found last", r == 4, f"got {r}")
r = binary_search([1, 3, 5, 7, 9], 4)
test("bs: not found", r == -1, f"got {r}")
r = binary_search([], 1)
test("bs: empty array", r == -1, f"got {r}")
r = binary_search([42], 42)
test("bs: single element found", r == 0, f"got {r}")
r = binary_search([42], 1)
test("bs: single element not found", r == -1, f"got {r}")

# search_insert_position
r = search_insert_position([1, 3, 5, 6], 5)
test("insert: target exists", r == 2, f"got {r}")
r = search_insert_position([1, 3, 5, 6], 2)
test("insert: between elements", r == 1, f"got {r}")
r = search_insert_position([1, 3, 5, 6], 7)
test("insert: after all", r == 4, f"got {r}")
r = search_insert_position([1, 3, 5, 6], 0)
test("insert: before all", r == 0, f"got {r}")
r = search_insert_position([], 5)
test("insert: empty array", r == 0, f"got {r}")

# find_min_in_rotated_array
r = find_min_in_rotated_array([3, 4, 5, 1, 2])
test("rotated: pivot in middle", r == 1, f"got {r}")
r = find_min_in_rotated_array([4, 5, 6, 7, 0, 1, 2])
test("rotated: standard LeetCode", r == 0, f"got {r}")
r = find_min_in_rotated_array([1])
test("rotated: single element", r == 1, f"got {r}")
r = find_min_in_rotated_array([2, 1])
test("rotated: two elements", r == 1, f"got {r}")
r = find_min_in_rotated_array([1, 2, 3, 4, 5])
test("rotated: no rotation", r == 1, f"got {r}")
r = find_min_in_rotated_array([2, 3, 4, 5, 1])
test("rotated: pivot at end", r == 1, f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
