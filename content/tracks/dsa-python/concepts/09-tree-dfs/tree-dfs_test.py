import sys
from stub import TreeNode, max_depth, has_path_sum, lowest_common_ancestor, _build

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


def find_node(root: "TreeNode | None", val: int) -> "TreeNode | None":
    if root is None:
        return None
    if root.val == val:
        return root
    return find_node(root.left, val) or find_node(root.right, val)


# max_depth
test("depth: balanced h=3", max_depth(_build([3, 9, 20, None, None, 15, 7])) == 3)
test("depth: empty tree", max_depth(None) == 0)
test("depth: single node", max_depth(TreeNode(1)) == 1)
test("depth: two nodes", max_depth(_build([1, 2])) == 2)
test("depth: full 3 levels", max_depth(_build([1, 2, 3, 4, 5, 6, 7])) == 3)

# has_path_sum
test("pathsum: 5->4->11->2=22 exists", has_path_sum(_build([5, 4, 8, 11, None, 13, 4, 7, 2]), 22) is True)
test("pathsum: no path to 5", has_path_sum(_build([1, 2, 3]), 5) is False)
test("pathsum: empty tree", has_path_sum(None, 0) is False)
test("pathsum: single node matches", has_path_sum(TreeNode(7), 7) is True)
test("pathsum: single node no match", has_path_sum(TreeNode(7), 1) is False)
test("pathsum: negative values", has_path_sum(_build([-3, 1, -2]), -5) is True)

# lowest_common_ancestor
# Tree: [3,5,1,6,2,0,8,null,null,7,4]
root = _build([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
p5 = find_node(root, 5)
p1 = find_node(root, 1)
p4 = find_node(root, 4)
p6 = find_node(root, 6)
p3 = find_node(root, 3)

lca = lowest_common_ancestor(root, p5, p1)
test("lca: 5,1 -> 3", lca is not None and lca.val == 3, f"got {lca.val if lca else None}")

lca = lowest_common_ancestor(root, p5, p4)
test("lca: 5,4 -> 5 (5 is ancestor)", lca is not None and lca.val == 5, f"got {lca.val if lca else None}")

lca = lowest_common_ancestor(root, p6, p4)
test("lca: 6,4 -> 5", lca is not None and lca.val == 5, f"got {lca.val if lca else None}")

lca = lowest_common_ancestor(root, p3, p1)
test("lca: root,1 -> root", lca is not None and lca.val == 3, f"got {lca.val if lca else None}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
