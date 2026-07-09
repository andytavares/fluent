from stub import max_sub_array, max_subarray_sum_circular

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


# ── max_sub_array ──
result = max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4])
test("max_sub_array: classic example", result == 6, f"got {result}")

result = max_sub_array([1])
test("max_sub_array: single element", result == 1, f"got {result}")

result = max_sub_array([-7])
test("max_sub_array: single negative element", result == -7, f"got {result}")

result = max_sub_array([5, 4, -1, 7, 8])
test("max_sub_array: all positive — the whole array", result == 23, f"got {result}")

result = max_sub_array([-3, -1, -2])
test("max_sub_array: all negative — largest element, never 0", result == -1, f"got {result}")

result = max_sub_array([-5, 3, 4])
test("max_sub_array: negative prefix must be dropped", result == 7, f"got {result}")

result = max_sub_array([3, 4, -10])
test("max_sub_array: negative suffix must be ignored", result == 7, f"got {result}")

result = max_sub_array([-1, 0, -2])
test("max_sub_array: zeros mixed with negatives", result == 0, f"got {result}")

result = max_sub_array([4, -1, 5])
test("max_sub_array: dip worth crossing", result == 8, f"got {result}")

result = max_sub_array([5, -10, 6])
test("max_sub_array: dip not worth crossing", result == 6, f"got {result}")

nums = [-1] * 2000 + [10] * 100 + [-1] * 2000
result = max_sub_array(nums)
test("max_sub_array: large input — one positive block hidden in noise", result == 1000, f"got {result}")

nums = [1 if i % 2 == 0 else -2 for i in range(10000)]
result = max_sub_array(nums)
test("max_sub_array: large alternating input", result == 1, f"got {result}")

nums = [10] * 50 + [-3] + [10] * 50
result = max_sub_array(nums)
test("max_sub_array: two blocks joined by a shallow dip", result == 997, f"got {result}")

# ── max_subarray_sum_circular ──
result = max_subarray_sum_circular([1, -2, 3, -2])
test("max_subarray_sum_circular: no wrap needed", result == 3, f"got {result}")

result = max_subarray_sum_circular([5, -3, 5])
test("max_subarray_sum_circular: wrap wins", result == 10, f"got {result}")

result = max_subarray_sum_circular([-3, -2, -3])
test("max_subarray_sum_circular: all negative — single element, not 0", result == -2, f"got {result}")

result = max_subarray_sum_circular([7])
test("max_subarray_sum_circular: single element", result == 7, f"got {result}")

result = max_subarray_sum_circular([-4])
test("max_subarray_sum_circular: single negative element", result == -4, f"got {result}")

result = max_subarray_sum_circular([3, -1, 2, -1])
test("max_subarray_sum_circular: wrap combining suffix and prefix", result == 4, f"got {result}")

result = max_subarray_sum_circular([1, 2, 3, 4])
test("max_subarray_sum_circular: all positive — whole circle", result == 10, f"got {result}")

result = max_subarray_sum_circular([-2, 4, -5, 4, -5, 9, 4])
test("max_subarray_sum_circular: wrap skips the minimum middle", result == 15, f"got {result}")

result = max_subarray_sum_circular([0, 0, 0])
test("max_subarray_sum_circular: all zeros", result == 0, f"got {result}")

result = max_subarray_sum_circular([-2, -1])
test("max_subarray_sum_circular: -2 and -1 only", result == -1, f"got {result}")

nums = [10] * 50 + [-1] * 5000 + [10] * 50
result = max_subarray_sum_circular(nums)
test("max_subarray_sum_circular: large input — block split across the boundary", result == 1000, f"got {result}")

nums = [-(i + 1) for i in range(5000)]
result = max_subarray_sum_circular(nums)
test("max_subarray_sum_circular: large all-negative input", result == -1, f"got {result}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
