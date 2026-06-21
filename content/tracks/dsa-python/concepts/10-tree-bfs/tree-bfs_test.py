import sys
from stub import TreeNode, level_order, right_side_view, zigzag_level_order, _build

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


# level_order
r = level_order(_build([3, 9, 20, None, None, 15, 7]))
test("level_order: standard", r == [[3], [9, 20], [15, 7]], f"got {r}")
test("level_order: empty tree", level_order(None) == [])
r = level_order(_build([1]))
test("level_order: single node", r == [[1]], f"got {r}")
r = level_order(_build([1, 2, 3, 4, 5]))
test("level_order: three levels", r == [[1], [2, 3], [4, 5]], f"got {r}")
n1 = TreeNode(1); n2 = TreeNode(2); n3 = TreeNode(3)
n1.right = n2; n2.right = n3
r = level_order(n1)
test("level_order: right-skewed", r == [[1], [2], [3]], f"got {r}")

# right_side_view
r = right_side_view(_build([1, 2, 3, None, 5, None, 4]))
test("right_view: standard", r == [1, 3, 4], f"got {r}")
r = right_side_view(_build([1, None, 3]))
test("right_view: right only", r == [1, 3], f"got {r}")
test("right_view: empty", right_side_view(None) == [])
r = right_side_view(_build([1]))
test("right_view: single", r == [1], f"got {r}")
r = right_side_view(_build([1, 2, 3, 4]))
test("right_view: deeper left visible", r == [1, 3, 4], f"got {r}")

# zigzag_level_order
r = zigzag_level_order(_build([3, 9, 20, None, None, 15, 7]))
test("zigzag: standard", r == [[3], [20, 9], [15, 7]], f"got {r}")
r = zigzag_level_order(_build([1]))
test("zigzag: single node", r == [[1]], f"got {r}")
test("zigzag: empty", zigzag_level_order(None) == [])
r = zigzag_level_order(_build([1, 2, 3, 4, 5, 6, 7]))
test("zigzag: 3 levels", r == [[1], [3, 2], [4, 5, 6, 7]], f"got {r}")
r = zigzag_level_order(_build([1, 2, 3]))
test("zigzag: 2 levels", r == [[1], [3, 2]], f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
