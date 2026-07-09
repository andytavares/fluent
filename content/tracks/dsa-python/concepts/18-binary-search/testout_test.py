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

r = search_insert([5], 1)
test("search_insert: single element, insert before", r == 0, f"got {r}")

r = search_insert([5], 9)
test("search_insert: single element, insert after", r == 1, f"got {r}")

r1 = search_insert([-10, -3, 0, 4], -3)
r2 = search_insert([-10, -3, 0, 4], -2)
test("search_insert: negative values", r1 == 1 and r2 == 2, f"got {r1}, {r2}")

nums = [i * 2 for i in range(5000)]  # evens 0..9998
r1 = search_insert(nums, 4000)
r2 = search_insert(nums, 4001)
r3 = search_insert(nums, -1)
r4 = search_insert(nums, 10000)
test(
    "search_insert: large array, every position",
    r1 == 2000 and r2 == 2001 and r3 == 0 and r4 == 5000,
    f"got {r1}, {r2}, {r3}, {r4}",
)

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

nums = []
for i in range(1, 3001):
    nums.append(0 - i)
    nums.append(i)
r = find_peak_element(nums)
test("find_peak_element: large sawtooth, any peak accepted", assert_is_peak(nums, r), f"index {r} not a peak")

up = list(range(5000))
down = [4998 - i for i in range(5000)]
nums = up + down
r = find_peak_element(nums)
test("find_peak_element: large mountain, exact summit", r == 4999, f"got {r}")

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

base = [0, 1, 2, 3, 4, 5, 6]
all_rotations_ok = True
rotation_detail = ""
for rot in range(len(base)):
    nums = base[rot:] + base[:rot]
    for target in base:
        got = search_rotated(nums, target)
        want = nums.index(target)
        if got != want:
            all_rotations_ok = False
            rotation_detail = f"rotation {rot}, target {target}: got {got}, want {want}"
            break
    if not all_rotations_ok:
        break
    got_absent = search_rotated(nums, 99)
    if got_absent != -1:
        all_rotations_ok = False
        rotation_detail = f"rotation {rot}, absent target: got {got_absent}"
        break
test("search_rotated: every rotation of a small array", all_rotations_ok, rotation_detail)

n = 10000
nums = [(i + 7000) % n for i in range(n)]  # rotated by 3000
r1 = search_rotated(nums, 0)
r2 = search_rotated(nums, 9999)
r3 = search_rotated(nums, 7000)
test(
    "search_rotated: large rotated array",
    r1 == 3000 and r2 == 2999 and r3 == 0,
    f"got {r1}, {r2}, {r3}",
)

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

nums = [0] + [1] * 9998 + [2]
r = search_range(nums, 1)
test("search_range: huge run of duplicates", r == [1, 9998], f"got {r}")

nums = []
for v in range(1000):
    nums.extend([v * 10, v * 10, v * 10])
r1 = search_range(nums, 500)
r2 = search_range(nums, 505)
test(
    "search_range: large array, absent target between runs",
    r1 == [150, 152] and r2 == [-1, -1],
    f"got {r1}, {r2}",
)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
