import sys
from stub import is_palindrome, container_with_most_water, three_sum

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


# is_palindrome
test("palindrome: classic phrase", is_palindrome("A man, a plan, a canal: Panama") is True)
test("palindrome: not palindrome", is_palindrome("race a car") is False)
test("palindrome: empty string", is_palindrome("") is True)
test("palindrome: single char", is_palindrome("a") is True)
test("palindrome: digits", is_palindrome("12321") is True)
test("palindrome: digits false", is_palindrome("12345") is False)
test("palindrome: punctuation only", is_palindrome(".,!") is True)
test("palindrome: no lemon no melon", is_palindrome("No lemon, no melon") is True)

# container_with_most_water
r = container_with_most_water([1, 8, 6, 2, 5, 4, 8, 3, 7])
test("container: standard", r == 49, f"got {r}")
r = container_with_most_water([1, 1])
test("container: two equal", r == 1, f"got {r}")
r = container_with_most_water([4, 3, 2, 1, 4])
test("container: equal ends", r == 16, f"got {r}")
r = container_with_most_water([1, 2, 1])
test("container: three elements", r == 2, f"got {r}")
r = container_with_most_water([2, 3, 4, 5, 18, 17, 6])
test("container: best not at ends", r == 17 * 4, f"got {r}")

# three_sum
def sorted_triplets(lst: list[list[int]]) -> list[list[int]]:
    return sorted(sorted(t) for t in lst)

r = sorted_triplets(three_sum([-1, 0, 1, 2, -1, -4]))
test("three_sum: standard", r == [[-1, -1, 2], [-1, 0, 1]], f"got {r}")

r = sorted_triplets(three_sum([0, 0, 0]))
test("three_sum: all zeros", r == [[0, 0, 0]], f"got {r}")

r = sorted_triplets(three_sum([0, 1, 1]))
test("three_sum: no solution", r == [], f"got {r}")

r = sorted_triplets(three_sum([-2, 0, 0, 2, 2]))
test("three_sum: duplicates in input", r == [[-2, 0, 2]], f"got {r}")

r = sorted_triplets(three_sum([1, 2, 3]))
test("three_sum: no negative", r == [], f"got {r}")

r = sorted_triplets(three_sum([0, 0, 0, 0]))
test("three_sum: four zeros", r == [[0, 0, 0]], f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
