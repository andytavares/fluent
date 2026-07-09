import sys
from collections import deque
from stub import TreeNode, get_minimum_difference, kth_smallest, is_valid_bst

passed = 0
failed = 0


def test(name, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS: {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL: {name} — {e}")
        failed += 1


# Helper: builds a TreeNode tree from a level-order list with None for
# missing children, e.g. [4, 2, 6, 1, 3].
def build_tree(values):
    if len(values) == 0 or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1
    while i < len(values):
        node = queue.popleft()
        left_val = values[i]
        i += 1
        if left_val is not None:
            node.left = TreeNode(left_val)
            queue.append(node.left)
        if i < len(values):
            right_val = values[i]
            i += 1
            if right_val is not None:
                node.right = TreeNode(right_val)
                queue.append(node.right)
    return root


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


# -- get_minimum_difference --
test("get_minimum_difference: classic example", lambda: assert_eq(
    get_minimum_difference(build_tree([4, 2, 6, 1, 3])), 1))
test("get_minimum_difference: closest pair deep on the right", lambda: assert_eq(
    get_minimum_difference(build_tree([1, 0, 48, None, None, 12, 49])), 1))
test("get_minimum_difference: exactly two nodes", lambda: assert_eq(
    get_minimum_difference(build_tree([1, None, 5])), 4))
test("get_minimum_difference: negative values", lambda: assert_eq(
    get_minimum_difference(build_tree([0, -3])), 3))
test("get_minimum_difference: evenly spaced values", lambda: assert_eq(
    get_minimum_difference(build_tree([10, 5, 15])), 5))
test("get_minimum_difference: closest pair crosses subtrees", lambda: assert_eq(
    get_minimum_difference(build_tree([5, 3, 8, 1, 4])), 1))

# -- kth_smallest --
test("kth_smallest: k = 1 returns the minimum", lambda: assert_eq(
    kth_smallest(build_tree([3, 1, 4, None, 2]), 1), 1))
test("kth_smallest: middle k", lambda: assert_eq(
    kth_smallest(build_tree([5, 3, 6, 2, 4, None, None, 1]), 3), 3))
test("kth_smallest: k = node count returns the maximum", lambda: assert_eq(
    kth_smallest(build_tree([4, 2, 6, 1, 3]), 5), 6))
test("kth_smallest: single-node tree", lambda: assert_eq(
    kth_smallest(build_tree([7]), 1), 7))
test("kth_smallest: left-skewed chain", lambda: assert_eq(
    kth_smallest(build_tree([3, 2, None, 1]), 2), 2))
test("kth_smallest: right-skewed chain", lambda: assert_eq(
    kth_smallest(build_tree([1, None, 2, None, 3]), 3), 3))

# -- is_valid_bst --
test("is_valid_bst: simple valid tree", lambda: assert_eq(
    is_valid_bst(build_tree([2, 1, 3])), True))
test("is_valid_bst: classic invalid tree", lambda: assert_eq(
    is_valid_bst(build_tree([5, 1, 4, None, None, 3, 6])), False))
test("is_valid_bst: violation against an ancestor, not the parent", lambda: assert_eq(
    is_valid_bst(build_tree([5, 4, 6, None, None, 3, 7])), False))
test("is_valid_bst: value in right subtree smaller than the root", lambda: assert_eq(
    is_valid_bst(build_tree([10, 5, 15, None, None, 6, 20])), False))
test("is_valid_bst: empty tree is valid", lambda: assert_eq(is_valid_bst(None), True))
test("is_valid_bst: single node is valid", lambda: assert_eq(
    is_valid_bst(build_tree([1])), True))
test("is_valid_bst: duplicate child is invalid", lambda: assert_eq(
    is_valid_bst(build_tree([2, 2])), False))
test("is_valid_bst: larger valid tree", lambda: assert_eq(
    is_valid_bst(build_tree([8, 4, 12, 2, 6, 10, 14])), True))
test("is_valid_bst: single node at the 32-bit integer maximum", lambda: assert_eq(
    is_valid_bst(build_tree([2147483647])), True))

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
