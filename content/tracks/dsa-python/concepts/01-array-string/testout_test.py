from stub import merge, remove_duplicates, majority_element, rotate

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


# ── merge — always assert on the mutated nums1, never on the return value ──
nums1 = [1, 2, 3, 0, 0, 0]
merge(nums1, 3, [2, 5, 6], 3)
test("merge: classic example mutates nums1 in place", nums1 == [1, 2, 2, 3, 5, 6], f"got {nums1}")

nums1 = [1]
merge(nums1, 1, [], 0)
test("merge: n = 0 leaves nums1 unchanged", nums1 == [1], f"got {nums1}")

nums1 = [0]
merge(nums1, 0, [2], 1)
test("merge: m = 0 copies nums2 across", nums1 == [2], f"got {nums1}")

nums1 = [4, 5, 6, 0, 0, 0]
merge(nums1, 3, [1, 2, 3], 3)
test("merge: all of nums2 smaller than nums1", nums1 == [1, 2, 3, 4, 5, 6], f"got {nums1}")

nums1 = [1, 3, 5, 7, 0, 0, 0, 0]
merge(nums1, 4, [2, 4, 6, 8], 4)
test("merge: interleaved values", nums1 == [1, 2, 3, 4, 5, 6, 7, 8], f"got {nums1}")

nums1 = [1, 1, 3, 0, 0, 0]
merge(nums1, 3, [1, 3, 3], 3)
test("merge: duplicates across both arrays", nums1 == [1, 1, 1, 3, 3, 3], f"got {nums1}")

nums1 = [-5, 0, 2, 0, 0]
merge(nums1, 3, [-10, 1], 2)
test("merge: negative numbers", nums1 == [-10, -5, 0, 1, 2], f"got {nums1}")

nums1 = [2, 0]
_ = merge(nums1, 1, [1], 1)
test("merge: works even if the return value is discarded", nums1 == [1, 2], f"got {nums1}")

a = [i * 2 for i in range(500)]      # evens
b = [i * 2 + 1 for i in range(500)]  # odds
nums1 = a + [0] * 500
merge(nums1, 500, b, 500)
expected = list(range(1000))
test("merge: large lists stay sorted", nums1 == expected)

# ── remove_duplicates — assert return k AND the mutated prefix ──
nums = [1, 1, 2]
k = remove_duplicates(nums)
test("remove_duplicates: simple duplicates", k == 2 and nums[:k] == [1, 2], f"got k={k}, prefix={nums[:k]}")

nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
k = remove_duplicates(nums)
test(
    "remove_duplicates: longer example mutates prefix in place",
    k == 5 and nums[:k] == [0, 1, 2, 3, 4],
    f"got k={k}, prefix={nums[:k]}",
)

nums = [1, 2, 3]
k = remove_duplicates(nums)
test("remove_duplicates: no duplicates", k == 3 and nums[:k] == [1, 2, 3], f"got k={k}, prefix={nums[:k]}")

nums = [7, 7, 7]
k = remove_duplicates(nums)
test("remove_duplicates: all elements identical", k == 1 and nums[:k] == [7], f"got k={k}, prefix={nums[:k]}")

nums = [5]
k = remove_duplicates(nums)
test("remove_duplicates: single element", k == 1 and nums[:k] == [5], f"got k={k}, prefix={nums[:k]}")

test("remove_duplicates: empty list returns 0", remove_duplicates([]) == 0)

nums = [-3, -3, -1, 0, 0]
k = remove_duplicates(nums)
test("remove_duplicates: negative values", k == 3 and nums[:k] == [-3, -1, 0], f"got k={k}, prefix={nums[:k]}")

nums = [v for v in range(100) for _ in range(10)]
k = remove_duplicates(nums)
test(
    "remove_duplicates: long runs",
    k == 100 and nums[:k] == list(range(100)),
    f"got k={k}, prefix={nums[:k]}",
)

# ── majority_element ──
test("majority_element: simple majority", majority_element([3, 2, 3]) == 3)
test("majority_element: majority split across the list", majority_element([2, 2, 1, 1, 1, 2, 2]) == 2)
test("majority_element: single element", majority_element([5]) == 5)
test("majority_element: all elements identical", majority_element([4, 4, 4, 4]) == 4)
test("majority_element: negative majority", majority_element([-1, -1, 2, -1, 3]) == -1)
test("majority_element: majority concentrated at the end", majority_element([1, 2, 9, 9, 9]) == 9)

# 501 sevens interleaved with 500 distinct values — cancels a naive
# "most recent value wins" approach.
nums = []
for i in range(500):
    nums.append(7)
    nums.append(i + 1000)
nums.append(7)
test("majority_element: large adversarial input", majority_element(nums) == 7)

# ── rotate — always assert on the mutated list, never on the return value ──
nums = [1, 2, 3, 4, 5, 6, 7]
rotate(nums, 3)
test("rotate: classic example mutates in place", nums == [5, 6, 7, 1, 2, 3, 4], f"got {nums}")

nums = [-1, -100, 3, 99]
rotate(nums, 2)
test("rotate: negatives", nums == [3, 99, -1, -100], f"got {nums}")

nums = [1, 2, 3]
rotate(nums, 0)
test("rotate: k = 0 is a no-op", nums == [1, 2, 3], f"got {nums}")

nums = [1, 2, 3]
rotate(nums, 3)
test("rotate: k equal to length is a no-op", nums == [1, 2, 3], f"got {nums}")

nums = [1, 2]
rotate(nums, 5)  # 5 % 2 == 1
test("rotate: k larger than length wraps", nums == [2, 1], f"got {nums}")

nums = [42]
rotate(nums, 10)
test("rotate: single element", nums == [42], f"got {nums}")

nums = [1, 2, 3, 4]
_ = rotate(nums, 1)
test("rotate: works even if the return value is discarded", nums == [4, 1, 2, 3], f"got {nums}")

n = 1000
nums = list(range(n))
k = 100003  # 100003 % 1000 == 3
rotate(nums, k)
expected = [(i + n - 3) % n for i in range(n)]
test("rotate: very large k on a large list", nums == expected)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
