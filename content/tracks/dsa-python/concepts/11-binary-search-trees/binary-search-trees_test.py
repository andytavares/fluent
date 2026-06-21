import sys
from stub import TreeNode, is_valid_bst, kth_smallest, build_bst_from_preorder, _build

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


def inorder(root: "TreeNode | None") -> list[int]:
    result: list[int] = []
    def dfs(node: "TreeNode | None") -> None:
        if node is None:
            return
        dfs(node.left)
        result.append(node.val)
        dfs(node.right)
    dfs(root)
    return result


# is_valid_bst
test("valid_bst: simple valid [2,1,3]", is_valid_bst(_build([2, 1, 3])) is True)
test("valid_bst: right child invalid", is_valid_bst(_build([5, 1, 4, None, None, 3, 6])) is False)
test("valid_bst: empty tree", is_valid_bst(None) is True)
test("valid_bst: single node", is_valid_bst(_build([1])) is True)
test("valid_bst: cross-subtree trap [10,5,15,null,null,6,20]",
     is_valid_bst(_build([10, 5, 15, None, None, 6, 20])) is False)
test("valid_bst: deep valid", is_valid_bst(_build([5, 4, 6, 3, None, None, 7])) is True)

# kth_smallest
test("kth: k=1 in [3,1,4,null,2]", kth_smallest(_build([3, 1, 4, None, 2]), 1) == 1)
test("kth: k=3 in [3,1,4,null,2]", kth_smallest(_build([3, 1, 4, None, 2]), 3) == 3)
test("kth: k=3 in [5,3,6,2,4,null,null,1]", kth_smallest(_build([5, 3, 6, 2, 4, None, None, 1]), 3) == 3)
test("kth: single node k=1", kth_smallest(_build([1]), 1) == 1)
test("kth: k=4 in [3,1,4,null,2]", kth_smallest(_build([3, 1, 4, None, 2]), 4) == 4)

# build_bst_from_preorder
r = build_bst_from_preorder([8, 5, 1, 7, 10, 12])
test("build_preorder: root is 8", r is not None and r.val == 8, f"got {r.val if r else None}")
test("build_preorder: inorder is sorted", inorder(r) == [1, 5, 7, 8, 10, 12], f"got {inorder(r)}")
r2 = build_bst_from_preorder([1])
test("build_preorder: single element", r2 is not None and r2.val == 1 and r2.left is None and r2.right is None)
r3 = build_bst_from_preorder([])
test("build_preorder: empty list", r3 is None)
r4 = build_bst_from_preorder([4, 2, 1, 3, 6, 5, 7])
test("build_preorder: balanced BST inorder", inorder(r4) == [1, 2, 3, 4, 5, 6, 7], f"got {inorder(r4)}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
