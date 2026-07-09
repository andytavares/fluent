import sys
from collections import deque
from stub import TreeNode, level_order, right_side_view, zigzag_level_order

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


def build_perfect(depth, index=1):
    """Perfect binary tree of the given depth; values are heap indexes."""
    if depth == 0:
        return None
    return TreeNode(index, build_perfect(depth - 1, index * 2), build_perfect(depth - 1, index * 2 + 1))


def build_chain(length):
    """Chain of `length` nodes alternating left/right children, values 0..length-1."""
    if length == 0:
        return None
    root = TreeNode(0)
    node = root
    for v in range(1, length):
        child = TreeNode(v)
        if v % 2 == 0:
            node.left = child
        else:
            node.right = child
        node = child
    return root


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


# -- level_order --
test("level_order: classic three-level tree", lambda: assert_eq(
    level_order(build_tree([3, 9, 20, None, None, 15, 7])), [[3], [9, 20], [15, 7]]))
test("level_order: empty tree returns []", lambda: assert_eq(level_order(None), []))
test("level_order: single node", lambda: assert_eq(level_order(build_tree([1])), [[1]]))
test("level_order: left-skewed chain — one node per level", lambda: assert_eq(
    level_order(build_tree([1, 2, None, 3])), [[1], [2], [3]]))
test("level_order: right-skewed chain", lambda: assert_eq(
    level_order(build_tree([1, None, 2, None, 3])), [[1], [2], [3]]))
test("level_order: negative values", lambda: assert_eq(
    level_order(build_tree([-1, -2, -3])), [[-1], [-2, -3]]))
test("level_order: full three-level tree keeps left-to-right order", lambda: assert_eq(
    level_order(build_tree([1, 2, 3, 4, 5, 6, 7])), [[1], [2, 3], [4, 5, 6, 7]]))


def _perfect_level_order():
    result = level_order(build_perfect(10))
    assert_eq(len(result), 10)
    for d in range(10):
        expected = [2 ** d + i for i in range(2 ** d)]
        assert_eq(result[d], expected)


test("level_order: perfect depth-10 tree — every level complete and ordered", _perfect_level_order)


def _chain_level_order():
    result = level_order(build_chain(1500))
    assert_eq(len(result), 1500)
    assert_eq(result[0], [0])
    assert_eq(result[1499], [1499])
    assert_eq(result[777], [777])


test("level_order: 1500-node zigzag chain — one value per level", _chain_level_order)

# -- right_side_view --
test("right_side_view: classic example", lambda: assert_eq(
    right_side_view(build_tree([1, 2, 3, None, 5, None, 4])), [1, 3, 4]))
test("right_side_view: empty tree returns []", lambda: assert_eq(right_side_view(None), []))
test("right_side_view: single node", lambda: assert_eq(right_side_view(build_tree([7])), [7]))
test("right_side_view: right-only chain", lambda: assert_eq(
    right_side_view(build_tree([1, None, 3])), [1, 3]))
test("right_side_view: left-only chain is fully visible", lambda: assert_eq(
    right_side_view(build_tree([1, 2, None, 3])), [1, 2, 3]))
test("right_side_view: left-subtree node visible when right side ends", lambda: assert_eq(
    right_side_view(build_tree([1, 2, 3, 4])), [1, 3, 4]))
test("right_side_view: view switches between subtrees on the way down", lambda: assert_eq(
    right_side_view(build_tree([1, 2, 3, None, 4, None, None, 5])), [1, 3, 4, 5]))


def _perfect_right_view():
    expected = [2 ** (d + 1) - 1 for d in range(10)]
    assert_eq(right_side_view(build_perfect(10)), expected)


test("right_side_view: perfect depth-10 tree — rightmost heap indexes", _perfect_right_view)


def _chain_right_view():
    expected = list(range(1500))
    assert_eq(right_side_view(build_chain(1500)), expected)


test("right_side_view: 1500-node chain shows every value", _chain_right_view)

# -- zigzag_level_order --
test("zigzag_level_order: classic three-level tree", lambda: assert_eq(
    zigzag_level_order(build_tree([3, 9, 20, None, None, 15, 7])), [[3], [20, 9], [15, 7]]))
test("zigzag_level_order: empty tree returns []", lambda: assert_eq(zigzag_level_order(None), []))
test("zigzag_level_order: single node", lambda: assert_eq(
    zigzag_level_order(build_tree([1])), [[1]]))
test("zigzag_level_order: full three-level tree", lambda: assert_eq(
    zigzag_level_order(build_tree([1, 2, 3, 4, 5, 6, 7])), [[1], [3, 2], [4, 5, 6, 7]]))
test("zigzag_level_order: four levels flip direction twice", lambda: assert_eq(
    zigzag_level_order(build_tree([1, 2, 3, 4, None, None, 5, 6, None, None, 7])),
    [[1], [3, 2], [4, 5], [7, 6]]))
test("zigzag_level_order: single-node levels are unaffected by direction", lambda: assert_eq(
    zigzag_level_order(build_tree([1, 2, None, 3])), [[1], [2], [3]]))


def _perfect_zigzag():
    result = zigzag_level_order(build_perfect(10))
    assert_eq(len(result), 10)
    for d in range(10):
        level = [2 ** d + i for i in range(2 ** d)]
        if d % 2 == 1:
            level.reverse()
        assert_eq(result[d], level)


test("zigzag_level_order: perfect depth-10 tree — odd levels reversed", _perfect_zigzag)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
