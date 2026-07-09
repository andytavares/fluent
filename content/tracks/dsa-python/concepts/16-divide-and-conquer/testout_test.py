import sys
from stub import TreeNode, ListNode, sorted_array_to_bst, sort_list, merge_k_lists

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


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


# -- helpers: linked list --
def from_list(values):
    head = None
    tail = None
    for v in values:
        node = ListNode(v)
        if head is None:
            head = node
        else:
            tail.next = node
        tail = node
    return head


def to_list(head):
    out = []
    node = head
    while node is not None:
        out.append(node.val)
        node = node.next
    return out


def collect_nodes(head):
    result = set()
    node = head
    while node is not None:
        result.add(id(node))
        node = node.next
    return result


def assert_reuses_nodes(head, allowed):
    count = 0
    node = head
    while node is not None:
        assert id(node) in allowed, f"node with val {node.val} is not an original input node"
        count += 1
        node = node.next
    assert_eq(count, len(allowed))


# -- helpers: binary tree --
def inorder(root, out=None):
    if out is None:
        out = []
    if root is None:
        return out
    inorder(root.left, out)
    out.append(root.val)
    inorder(root.right, out)
    return out


def balanced_height(root):
    if root is None:
        return 0
    left = balanced_height(root.left)
    if left == -1:
        return -1
    right = balanced_height(root.right)
    if right == -1:
        return -1
    if abs(left - right) > 1:
        return -1
    return max(left, right) + 1


def assert_balanced_bst(root, sorted_values):
    assert_eq(inorder(root), sorted_values)
    assert balanced_height(root) != -1, "tree must be height-balanced at every node"


def shuffled(values):
    """Deterministic shuffle (Park-Miller LCG Fisher-Yates)."""
    arr = list(values)
    x = 42
    for i in range(len(arr) - 1, 0, -1):
        x = (x * 48271) % 2147483647
        j = x % (i + 1)
        arr[i], arr[j] = arr[j], arr[i]
    return arr


# -- sorted_array_to_bst --
test("sorted_array_to_bst: empty array returns None", lambda: assert_eq(
    sorted_array_to_bst([]), None))


def _single_leaf():
    root = sorted_array_to_bst([7])
    assert_eq(root.val, 7)
    assert_eq(root.left, None)
    assert_eq(root.right, None)


test("sorted_array_to_bst: single element is a leaf", _single_leaf)
test("sorted_array_to_bst: two elements", lambda: assert_balanced_bst(
    sorted_array_to_bst([1, 2]), [1, 2]))
test("sorted_array_to_bst: three elements", lambda: assert_balanced_bst(
    sorted_array_to_bst([1, 2, 3]), [1, 2, 3]))
test("sorted_array_to_bst: classic [-10,-3,0,5,9]", lambda: assert_balanced_bst(
    sorted_array_to_bst([-10, -3, 0, 5, 9]), [-10, -3, 0, 5, 9]))


def _fifteen_elements():
    nums = list(range(1, 16))
    assert_balanced_bst(sorted_array_to_bst(nums), nums)


test("sorted_array_to_bst: 15 elements build a balanced tree", _fifteen_elements)


def _hundred_elements():
    nums = [i * 3 - 50 for i in range(100)]
    root = sorted_array_to_bst(nums)
    assert_balanced_bst(root, nums)
    assert balanced_height(root) <= 9, "height must be logarithmic"


test("sorted_array_to_bst: 100 elements — unbalanced insertion would fail here", _hundred_elements)


def _1023_elements():
    nums = list(range(1023))
    root = sorted_array_to_bst(nums)
    assert_balanced_bst(root, nums)
    h = balanced_height(root)
    assert 10 <= h <= 14, f"height {h} out of balanced range"


test("sorted_array_to_bst: 1023 elements stay balanced and logarithmic", _1023_elements)

# -- sort_list --
test("sort_list: None returns None", lambda: assert_eq(sort_list(None), None))


def _single_node():
    head = from_list([5])
    sorted_head = sort_list(head)
    assert sorted_head is head
    assert_eq(to_list(sorted_head), [5])


test("sort_list: single node returned as-is", _single_node)
test("sort_list: two nodes out of order", lambda: assert_eq(
    to_list(sort_list(from_list([2, 1]))), [1, 2]))
test("sort_list: classic 4->2->1->3", lambda: assert_eq(
    to_list(sort_list(from_list([4, 2, 1, 3]))), [1, 2, 3, 4]))
test("sort_list: negatives and duplicates", lambda: assert_eq(
    to_list(sort_list(from_list([-1, 5, 3, 4, 0, 3]))), [-1, 0, 3, 3, 4, 5]))
test("sort_list: already sorted", lambda: assert_eq(
    to_list(sort_list(from_list([1, 2, 3, 4, 5]))), [1, 2, 3, 4, 5]))
test("sort_list: reverse sorted", lambda: assert_eq(
    to_list(sort_list(from_list([5, 4, 3, 2, 1]))), [1, 2, 3, 4, 5]))


def _relinks_nodes():
    head = from_list([3, 1, 2])
    original = collect_nodes(head)
    sorted_head = sort_list(head)
    assert_eq(to_list(sorted_head), [1, 2, 3])
    assert_reuses_nodes(sorted_head, original)


test("sort_list: relinks the original nodes (no new allocation)", _relinks_nodes)


def _big_shuffle():
    expected = list(range(2000))
    head = from_list(shuffled(expected))
    original = collect_nodes(head)
    sorted_head = sort_list(head)
    assert_eq(to_list(sorted_head), expected)
    assert_reuses_nodes(sorted_head, original)


test("sort_list: 2000 shuffled values — O(n log n) or bust", _big_shuffle)
test("sort_list: all values equal", lambda: assert_eq(
    to_list(sort_list(from_list([9, 9, 9, 9]))), [9, 9, 9, 9]))

# -- merge_k_lists --
test("merge_k_lists: empty list returns None", lambda: assert_eq(merge_k_lists([]), None))
test("merge_k_lists: [None] returns None", lambda: assert_eq(merge_k_lists([None]), None))
test("merge_k_lists: all entries None returns None", lambda: assert_eq(
    merge_k_lists([None, None, None]), None))


def _classic_three():
    lists = [from_list([1, 4, 5]), from_list([1, 3, 4]), from_list([2, 6])]
    assert_eq(to_list(merge_k_lists(lists)), [1, 1, 2, 3, 4, 4, 5, 6])


test("merge_k_lists: classic three lists", _classic_three)


def _single_passthrough():
    lists = [from_list([1, 2, 3])]
    assert_eq(to_list(merge_k_lists(lists)), [1, 2, 3])


test("merge_k_lists: single list passes through", _single_passthrough)


def _nulls_mixed():
    lists = [None, from_list([2, 4]), None, from_list([1, 3])]
    assert_eq(to_list(merge_k_lists(lists)), [1, 2, 3, 4])


test("merge_k_lists: nulls mixed with real lists", _nulls_mixed)


def _single_node_lists():
    lists = [from_list([v]) for v in [5, 1, 4, 2, 3]]
    assert_eq(to_list(merge_k_lists(lists)), [1, 2, 3, 4, 5])


test("merge_k_lists: k single-node lists", _single_node_lists)


def _duplicates_across():
    lists = [from_list([1, 1, 2]), from_list([1, 2, 2])]
    assert_eq(to_list(merge_k_lists(lists)), [1, 1, 1, 2, 2, 2])


test("merge_k_lists: duplicates across lists", _duplicates_across)


def _reuses_nodes():
    lists = [from_list([1, 4]), from_list([2, 3])]
    original = collect_nodes(lists[0]) | collect_nodes(lists[1])
    merged = merge_k_lists(lists)
    assert_eq(to_list(merged), [1, 2, 3, 4])
    assert_reuses_nodes(merged, original)


test("merge_k_lists: reuses the original nodes (no new allocation)", _reuses_nodes)


def _64_interleaved():
    k, length = 64, 50
    lists = []
    all_nodes = set()
    for i in range(k):
        head = from_list([i + j * k for j in range(length)])
        all_nodes |= collect_nodes(head)
        lists.append(head)
    merged = merge_k_lists(lists)
    assert_eq(to_list(merged), list(range(k * length)))
    assert_reuses_nodes(merged, all_nodes)


test("merge_k_lists: 64 interleaved lists of 50 nodes each", _64_interleaved)


def _wildly_different_lengths():
    lists = [
        from_list([100]),
        from_list(list(range(99))),
        None,
        from_list([50, 150]),
    ]
    expected = sorted(list(range(99)) + [50, 100, 150])
    assert_eq(to_list(merge_k_lists(lists)), expected)


test("merge_k_lists: lists of wildly different lengths", _wildly_different_lengths)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
