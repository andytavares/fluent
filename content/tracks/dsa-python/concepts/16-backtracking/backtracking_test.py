import sys
from stub import subsets, permutations, combination_sum

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


def normalize(lol: list[list[int]]) -> list[list[int]]:
    """Sort each inner list, then sort the outer list for order-independent comparison."""
    return sorted(sorted(inner) for inner in lol)


# subsets tests
result = normalize(subsets([1, 2, 3]))
expected = normalize([[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]])
test("subsets: [1,2,3]", result == expected, f"got {result}")

result = normalize(subsets([]))
test("subsets: empty input", result == [[]], f"got {result}")

result = normalize(subsets([1]))
test("subsets: single element", result == [[], [1]], f"got {result}")

result = normalize(subsets([0]))
test("subsets: single zero", result == [[], [0]], f"got {result}")

# Check count only for larger input
result = subsets([1, 2, 3, 4])
test("subsets: [1,2,3,4] count", len(result) == 16, f"got {len(result)} subsets, want 16")

# permutations tests
result = normalize(permutations([1, 2, 3]))
expected = normalize([[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]])
test("perms: [1,2,3]", result == expected, f"got {result}")

result = normalize(permutations([1]))
test("perms: single element", result == [[1]], f"got {result}")

result = normalize(permutations([]))
test("perms: empty", result == [[]], f"got {result}")

result = permutations([1, 2, 3, 4])
test("perms: [1,2,3,4] count", len(result) == 24, f"got {len(result)}, want 24")

# combination_sum tests
result = normalize(combination_sum([2, 3, 6, 7], 7))
expected = normalize([[2, 2, 3], [7]])
test("combo_sum: [2,3,6,7] target=7", result == expected, f"got {result}")

result = normalize(combination_sum([2, 3, 5], 8))
expected = normalize([[2, 2, 2, 2], [2, 3, 3], [3, 5]])
test("combo_sum: [2,3,5] target=8", result == expected, f"got {result}")

result = combination_sum([2], 1)
test("combo_sum: impossible", result == [], f"got {result}")

result = normalize(combination_sum([1], 3))
test("combo_sum: single coin", result == [[1, 1, 1]], f"got {result}")

result = normalize(combination_sum([2, 4], 6))
expected = normalize([[2, 2, 2], [2, 4]])
test("combo_sum: [2,4] target=6", result == expected, f"got {result}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
