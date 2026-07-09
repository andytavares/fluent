from stub import find_kth_largest, k_smallest_pairs, MedianFinder

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


def check_pairs(result, nums1, nums2, expected_sums) -> str:
    if not isinstance(result, list):
        return "expected a list of pairs"
    if len(result) != len(expected_sums):
        return f"expected {len(expected_sums)} pairs, got {len(result)}"
    for pair in result:
        if not (isinstance(pair, list) and len(pair) == 2):
            return f"malformed pair {pair}"
        if pair[0] not in nums1:
            return f"{pair[0]} is not in nums1"
        if pair[1] not in nums2:
            return f"{pair[1]} is not in nums2"
    sums = [u + v for u, v in result]
    if sums != expected_sums:
        return f"pair sums must match ascending order, got {sums}"
    return ""


# ── find_kth_largest ──
r = find_kth_largest([3, 2, 1, 5, 6, 4], 2)
test("find_kth_largest: classic example", r == 5, f"got {r}")

r = find_kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)
test("find_kth_largest: duplicates count separately", r == 4, f"got {r}")

r = find_kth_largest([2, 9, 4], 1)
test("find_kth_largest: k = 1 is the maximum", r == 9, f"got {r}")

r = find_kth_largest([2, 9, 4], 3)
test("find_kth_largest: k = length is the minimum", r == 2, f"got {r}")

r = find_kth_largest([1], 1)
test("find_kth_largest: single element", r == 1, f"got {r}")

r = find_kth_largest([7, 7, 7], 2)
test("find_kth_largest: all duplicates", r == 7, f"got {r}")

r = find_kth_largest([-1, -5, -3], 2)
test("find_kth_largest: negative numbers", r == -3, f"got {r}")

seed = 5
nums = []
for _ in range(10000):
    seed = (seed * 48271) % 2147483647
    nums.append(seed % 100000)
sorted_desc = sorted(nums, reverse=True)
r = find_kth_largest(nums, 2500)
test("find_kth_largest: large pseudo-random array", r == sorted_desc[2499], f"got {r}")

# ── k_smallest_pairs ──
r = k_smallest_pairs([1, 7, 11], [2, 4, 6], 3)
detail = check_pairs(r, [1, 7, 11], [2, 4, 6], [3, 5, 7])
test("k_smallest_pairs: classic example", detail == "", detail)

r = k_smallest_pairs([1, 1, 2], [1, 2, 3], 2)
detail = check_pairs(r, [1, 1, 2], [1, 2, 3], [2, 2])
test("k_smallest_pairs: duplicate values, equal sums", detail == "", detail)

r = k_smallest_pairs([1, 2], [3], 3)
detail = check_pairs(r, [1, 2], [3], [4, 5])
test("k_smallest_pairs: k exceeds total pairs — return them all", detail == "", detail)

r = k_smallest_pairs([1, 7], [2, 4], 1)
test("k_smallest_pairs: k = 1", r == [[1, 2]], f"got {r}")

r = k_smallest_pairs([], [1, 2], 5)
test("k_smallest_pairs: empty nums1", r == [], f"got {r}")

r = k_smallest_pairs([1, 2], [], 5)
test("k_smallest_pairs: empty nums2", r == [], f"got {r}")

r = k_smallest_pairs([-10, -4, 0], [-5, 3], 3)
detail = check_pairs(r, [-10, -4, 0], [-5, 3], [-15, -9, -7])
test("k_smallest_pairs: negative numbers", detail == "", detail)

r = k_smallest_pairs([1, 2], [1, 2], 4)
detail = check_pairs(r, [1, 2], [1, 2], [2, 3, 3, 4])
test("k_smallest_pairs: exact k equals total pairs", detail == "", detail)

nums1 = [i * 3 for i in range(5000)]      # 0, 3, 6, ...
nums2 = [i * 3 + 1 for i in range(5000)]  # 1, 4, 7, ...
r = k_smallest_pairs(nums1, nums2, 10)
detail = check_pairs(r, nums1, nums2, [1, 4, 4, 7, 7, 7, 10, 10, 10, 10])
test("k_smallest_pairs: large arrays, small k — must not materialize the grid", detail == "", detail)

# ── MedianFinder ──
mf = MedianFinder()
mf.add_num(1)
mf.add_num(2)
r1 = mf.find_median()
mf.add_num(3)
r2 = mf.find_median()
test("MedianFinder: classic sequence", r1 == 1.5 and r2 == 2, f"got {r1}, {r2}")

mf = MedianFinder()
mf.add_num(7)
r = mf.find_median()
test("MedianFinder: single element", r == 7, f"got {r}")

mf = MedianFinder()
for x in [5, 4, 3, 2, 1]:
    mf.add_num(x)
r = mf.find_median()
test("MedianFinder: descending insertion order", r == 3, f"got {r}")

mf = MedianFinder()
for x in [2, 2, 2]:
    mf.add_num(x)
r = mf.find_median()
test("MedianFinder: duplicates", r == 2, f"got {r}")

mf = MedianFinder()
for x in [-1, -2, -3, -4]:
    mf.add_num(x)
r = mf.find_median()
test("MedianFinder: negative numbers", r == -2.5, f"got {r}")

mf = MedianFinder()
stream = [6, 10, 2, 6, 5]
expected = [6, 8, 6, 6, 6]
all_match = True
mismatch = ""
for x, exp in zip(stream, expected):
    mf.add_num(x)
    got = mf.find_median()
    if got != exp:
        all_match = False
        mismatch = f"after adding {x}: got {got}, want {exp}"
        break
test("MedianFinder: median tracks every step", all_match, mismatch)

mf = MedianFinder()
seen = []
seed = 3
all_match = True
mismatch = ""
for i in range(1000):
    seed = (seed * 48271) % 2147483647
    x = seed % 500 - 250
    mf.add_num(x)
    seen.append(x)
    if i % 97 == 0:
        s = sorted(seen)
        n = len(s)
        exp = s[(n - 1) // 2] if n % 2 == 1 else (s[n // 2 - 1] + s[n // 2]) / 2
        got = mf.find_median()
        if got != exp:
            all_match = False
            mismatch = f"after {n} elements: got {got}, want {exp}"
            break
test("MedianFinder: long pseudo-random stream matches a sorted oracle", all_match, mismatch)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
