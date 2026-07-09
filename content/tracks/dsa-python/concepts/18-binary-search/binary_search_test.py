from stub import search_insert, find_peak_element, search_rotated, search_range

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


def assert_is_peak(nums: list[int], idx: int) -> bool:
    """True iff idx is a valid peak of nums (edges border -infinity)."""
    if not (isinstance(idx, int) and 0 <= idx < len(nums)):
        return False
    left_ok = idx == 0 or nums[idx] > nums[idx - 1]
    right_ok = idx == len(nums) - 1 or nums[idx] > nums[idx + 1]
    return left_ok and right_ok


# ── search_insert ──
r = search_insert([1, 3, 5, 6], 5)
test("search_insert: target present", r == 2, f"got {r}")

r = search_insert([1, 3, 5, 6], 2)
test("search_insert: target between elements", r == 1, f"got {r}")

r = search_insert([1, 3, 5, 6], 7)
test("search_insert: target larger than everything", r == 4, f"got {r}")

r = search_insert([1, 3, 5, 6], 0)
test("search_insert: target smaller than everything", r == 0, f"got {r}")

r = search_insert([], 4)
test("search_insert: empty array", r == 0, f"got {r}")

r = search_insert([5], 5)
test("search_insert: single element, found", r == 0, f"got {r}")

r = search_insert([5], 9)
test("search_insert: single element, insert after", r == 1, f"got {r}")

r1 = search_insert([-10, -3, 0, 4], -3)
r2 = search_insert([-10, -3, 0, 4], -2)
test("search_insert: negative values", r1 == 1 and r2 == 2, f"got {r1}, {r2}")

# ── find_peak_element ──
r = find_peak_element([1, 2, 3, 1])
test("find_peak_element: single interior peak", r == 2, f"got {r}")

nums = [1, 2, 1, 3, 5, 6, 4]
r = find_peak_element(nums)
test("find_peak_element: two peaks, either accepted", assert_is_peak(nums, r), f"index {r} not a peak")

r = find_peak_element([1])
test("find_peak_element: single element", r == 0, f"got {r}")

r = find_peak_element([2, 1])
test("find_peak_element: two elements, descending", r == 0, f"got {r}")

r = find_peak_element([1, 2])
test("find_peak_element: two elements, ascending", r == 1, f"got {r}")

r = find_peak_element([1, 2, 3, 4, 5])
test("find_peak_element: strictly ascending — peak at the end", r == 4, f"got {r}")

r = find_peak_element([5, 4, 3, 2, 1])
test("find_peak_element: strictly descending — peak at the start", r == 0, f"got {r}")

nums = [-5, -1, -3, -7]
r = find_peak_element(nums)
test("find_peak_element: negative values", assert_is_peak(nums, r), f"index {r} not a peak")

# ── search_rotated ──
r = search_rotated([4, 5, 6, 7, 0, 1, 2], 0)
test("search_rotated: target in the rotated tail", r == 4, f"got {r}")

r = search_rotated([4, 5, 6, 7, 0, 1, 2], 3)
test("search_rotated: target absent", r == -1, f"got {r}")

r = search_rotated([4, 5, 6, 7, 0, 1, 2], 5)
test("search_rotated: target in the sorted head", r == 1, f"got {r}")

r = search_rotated([1, 2, 3], 2)
test("search_rotated: not rotated at all", r == 1, f"got {r}")

r = search_rotated([1], 1)
test("search_rotated: single element, found", r == 0, f"got {r}")

r = search_rotated([1], 0)
test("search_rotated: single element, absent", r == -1, f"got {r}")

r1 = search_rotated([3, 1], 1)
r2 = search_rotated([3, 1], 3)
test("search_rotated: two elements rotated", r1 == 1 and r2 == 0, f"got {r1}, {r2}")

r = search_rotated([5, 6, 7, 1, 2, 3], 1)
test("search_rotated: target at the pivot (minimum)", r == 3, f"got {r}")

r1 = search_rotated([6, 7, 8, 1, 2, 3], 6)
r2 = search_rotated([6, 7, 8, 1, 2, 3], 3)
test("search_rotated: target at both ends", r1 == 0 and r2 == 5, f"got {r1}, {r2}")

# ── search_range ──
r = search_range([5, 7, 7, 8, 8, 10], 8)
test("search_range: run in the middle", r == [3, 4], f"got {r}")

r = search_range([5, 7, 7, 8, 8, 10], 6)
test("search_range: target absent inside value range", r == [-1, -1], f"got {r}")

r = search_range([], 0)
test("search_range: empty array", r == [-1, -1], f"got {r}")

r = search_range([2, 2, 2], 2)
test("search_range: whole array equals target", r == [0, 2], f"got {r}")

r = search_range([1, 4], 4)
test("search_range: single occurrence", r == [1, 1], f"got {r}")

r = search_range([3, 4, 5], 1)
test("search_range: target smaller than everything", r == [-1, -1], f"got {r}")

r = search_range([3, 4, 5], 9)
test("search_range: target larger than everything", r == [-1, -1], f"got {r}")

r = search_range([1, 1, 2, 3], 1)
test("search_range: run at the start", r == [0, 1], f"got {r}")

r = search_range([1, 2, 3, 3, 3], 3)
test("search_range: run at the end", r == [2, 4], f"got {r}")

r = search_range([-4, -4, -2, 0], -4)
test("search_range: negative values", r == [0, 1], f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
