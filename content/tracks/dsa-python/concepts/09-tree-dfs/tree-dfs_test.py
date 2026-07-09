import sys
from collections import deque
from stub import TreeNode, max_depth, is_same_tree, invert_tree, has_path_sum

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


# Helpers: nodes are TreeNode(val, left, right), None children.
# build_tree takes a level-order list where None marks an absent child
# (children of absent nodes are omitted).
def build_tree(values):
    if len(values) == 0 or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1
    while queue and i < len(values):
        node = queue.popleft()
        if i < len(values):
            v = values[i]
            i += 1
            if v is not None:
                node.left = TreeNode(v)
                queue.append(node.left)
        if i < len(values):
            v = values[i]
            i += 1
            if v is not None:
                node.right = TreeNode(v)
                queue.append(node.right)
    return root


# Level-order serialization with trailing Nones trimmed — the inverse of build_tree.
def tree_to_list(root):
    if root is None:
        return []
    out = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


# -- max_depth --
test("max_depth: classic tree", lambda: assert_eq(
    max_depth(build_tree([3, 9, 20, None, None, 15, 7])), 3))
test("max_depth: empty tree", lambda: assert_eq(max_depth(None), 0))
test("max_depth: single node", lambda: assert_eq(max_depth(build_tree([1])), 1))
test("max_depth: right-skewed chain", lambda: assert_eq(
    max_depth(build_tree([1, None, 2, None, 3])), 3))
test("max_depth: left-skewed chain", lambda: assert_eq(
    max_depth(build_tree([1, 2, None, 3, None, 4])), 4))
test("max_depth: deeper branch on one side", lambda: assert_eq(
    max_depth(build_tree([1, 2, 2, 3, None, None, 3, 4])), 4))

# -- is_same_tree --
test("is_same_tree: identical trees", lambda: assert_eq(
    is_same_tree(build_tree([1, 2, 3]), build_tree([1, 2, 3])), True))
test("is_same_tree: mirrored shape, same values", lambda: assert_eq(
    is_same_tree(build_tree([1, 2]), build_tree([1, None, 2])), False))
test("is_same_tree: same shape, swapped values", lambda: assert_eq(
    is_same_tree(build_tree([1, 2, 1]), build_tree([1, 1, 2])), False))
test("is_same_tree: both empty", lambda: assert_eq(is_same_tree(None, None), True))


def _one_empty():
    assert_eq(is_same_tree(build_tree([1]), None), False)
    assert_eq(is_same_tree(None, build_tree([1])), False)


test("is_same_tree: one empty", _one_empty)
test("is_same_tree: equal multi-level trees", lambda: assert_eq(
    is_same_tree(build_tree([5, 4, 8, 11, None, 13, 4]), build_tree([5, 4, 8, 11, None, 13, 4])), True))
test("is_same_tree: differ at a deep leaf", lambda: assert_eq(
    is_same_tree(build_tree([5, 4, 8, 11, None, 13, 4]), build_tree([5, 4, 8, 11, None, 13, 99])), False))

# -- invert_tree --
test("invert_tree: classic full tree", lambda: assert_eq(
    tree_to_list(invert_tree(build_tree([4, 2, 7, 1, 3, 6, 9]))), [4, 7, 2, 9, 6, 3, 1]))
test("invert_tree: empty tree", lambda: assert_eq(invert_tree(None), None))
test("invert_tree: single node", lambda: assert_eq(
    tree_to_list(invert_tree(build_tree([1]))), [1]))
test("invert_tree: three nodes", lambda: assert_eq(
    tree_to_list(invert_tree(build_tree([2, 1, 3]))), [2, 3, 1]))
test("invert_tree: lone left child moves right", lambda: assert_eq(
    tree_to_list(invert_tree(build_tree([1, 2]))), [1, None, 2]))
test("invert_tree: lone right child moves left", lambda: assert_eq(
    tree_to_list(invert_tree(build_tree([1, None, 2]))), [1, 2]))


def _mutates_in_place():
    root = build_tree([4, 2, 7])
    result = invert_tree(root)
    assert result is root, "expected the same object, not a copy"
    assert_eq(tree_to_list(root), [4, 7, 2])


test("invert_tree: mutates in place and returns the same root", _mutates_in_place)

# -- has_path_sum --
test("has_path_sum: classic tree, target 22", lambda: assert_eq(
    has_path_sum(build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1]), 22), True))
test("has_path_sum: no path hits the target", lambda: assert_eq(
    has_path_sum(build_tree([1, 2, 3]), 5), False))
test("has_path_sum: empty tree, target 0", lambda: assert_eq(has_path_sum(None, 0), False))
test("has_path_sum: partial path does not count (1 is not a leaf)", lambda: assert_eq(
    has_path_sum(build_tree([1, 2]), 1), False))
test("has_path_sum: path through a one-child node", lambda: assert_eq(
    has_path_sum(build_tree([1, 2]), 3), True))
test("has_path_sum: single node equals target", lambda: assert_eq(
    has_path_sum(build_tree([1]), 1), True))
test("has_path_sum: single node misses target", lambda: assert_eq(
    has_path_sum(build_tree([1]), 0), False))
test("has_path_sum: negative values reach a negative target", lambda: assert_eq(
    has_path_sum(build_tree([1, -2, -3, 1, 3, -2, None, -1]), -1), True))
test("has_path_sum: all-negative chain", lambda: assert_eq(
    has_path_sum(build_tree([-2, None, -3]), -5), True))

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
