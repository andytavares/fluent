import sys
from stub import build_prefix_sum, range_sum, subarray_sum_equals_k

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


# build_prefix_sum tests
result = build_prefix_sum([1, 2, 3, 4, 5])
test("build: standard", result == [0, 1, 3, 6, 10, 15], f"got {result}")

result = build_prefix_sum([])
test("build: empty", result == [0], f"got {result}")

result = build_prefix_sum([5])
test("build: single element", result == [0, 5], f"got {result}")

result = build_prefix_sum([-1, -2, 3])
test("build: negatives", result == [0, -1, -3, 0], f"got {result}")

# range_sum tests
prefix = [0, 1, 3, 6, 10, 15]
result = range_sum(prefix, 0, 4)
test("range_sum: full range", result == 15, f"got {result}, want 15")

result = range_sum(prefix, 1, 3)
test("range_sum: middle range", result == 9, f"got {result}, want 9")

result = range_sum(prefix, 2, 2)
test("range_sum: single element", result == 3, f"got {result}, want 3")

result = range_sum(prefix, 0, 0)
test("range_sum: first element", result == 1, f"got {result}, want 1")

# subarray_sum_equals_k tests
result = subarray_sum_equals_k([1, 1, 1], 2)
test("subarray_k: [1,1,1] k=2", result == 2, f"got {result}, want 2")

result = subarray_sum_equals_k([1, 2, 3], 3)
test("subarray_k: [1,2,3] k=3", result == 2, f"got {result}, want 2")

result = subarray_sum_equals_k([-1, -1, 1], 0)
test("subarray_k: negatives k=0", result == 1, f"got {result}, want 1")

result = subarray_sum_equals_k([3, 4, 7, 2, -3, 1, 4, 2], 7)
test("subarray_k: longer array k=7", result == 4, f"got {result}, want 4")

result = subarray_sum_equals_k([1], 1)
test("subarray_k: single element equals k", result == 1, f"got {result}, want 1")

result = subarray_sum_equals_k([1], 2)
test("subarray_k: single element no match", result == 0, f"got {result}, want 0")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
