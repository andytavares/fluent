from stub import is_palindrome, two_sum_ii, container_with_most_water, three_sum

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


def sorted_triplets(triplets: list[list[int]]) -> list[list[int]]:
    return sorted(sorted(t) for t in triplets)


# ── is_palindrome ──
test("is_palindrome: classic phrase", is_palindrome("A man, a plan, a canal: Panama") is True)
test("is_palindrome: not a palindrome", is_palindrome("race a car") is False)
test("is_palindrome: single space", is_palindrome(" ") is True)
test("is_palindrome: empty string", is_palindrome("") is True)
test("is_palindrome: punctuation only", is_palindrome(".,!?") is True)
test("is_palindrome: simple word", is_palindrome("racecar") is True)
test("is_palindrome: digits only", is_palindrome("12321") is True)
test("is_palindrome: digit vs letter is not a match", is_palindrome("0P") is False)
test("is_palindrome: mixed punctuation palindrome", is_palindrome("Was it a car or a cat I saw?") is True)
test("is_palindrome: single character", is_palindrome("a") is True)
test("is_palindrome: two different chars", is_palindrome("ab") is False)

half = "abcdefghij" * 50
s = half + "--- ### ---" + half[::-1]
test("is_palindrome: long palindrome with junk", is_palindrome(s) is True)

s = half + "X" + half[::-1] + "Y"
test("is_palindrome: long near-palindrome fails", is_palindrome(s) is False)

# ── two_sum_ii ──
test("two_sum_ii: classic example", two_sum_ii([2, 7, 11, 15], 9) == [1, 2])
test("two_sum_ii: pair not adjacent", two_sum_ii([2, 3, 4], 6) == [1, 3])
test("two_sum_ii: negative numbers", two_sum_ii([-1, 0], -1) == [1, 2])
test("two_sum_ii: duplicate values form the pair", two_sum_ii([1, 1, 2], 2) == [1, 2])
test("two_sum_ii: pair at the two ends", two_sum_ii([1, 3, 5, 10], 11) == [1, 4])
test("two_sum_ii: pair in the middle", two_sum_ii([1, 4, 6, 20], 10) == [2, 3])
test("two_sum_ii: all-negative list", two_sum_ii([-10, -8, -3, -1], -9) == [2, 4])

numbers = list(range(1, 10001))  # 1..10000
test("two_sum_ii: large list, pair deep inside", two_sum_ii(numbers, 19999) == [9999, 10000])

# ── container_with_most_water ──
test("container_with_most_water: classic example", container_with_most_water([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49)
test("container_with_most_water: two elements equal", container_with_most_water([1, 1]) == 1)
test("container_with_most_water: two elements unequal", container_with_most_water([4, 3]) == 3)
test("container_with_most_water: ascending heights", container_with_most_water([1, 2, 3, 4, 5]) == 6)
test("container_with_most_water: all same height", container_with_most_water([5, 5, 5, 5]) == 15)
test("container_with_most_water: best pair not at ends", container_with_most_water([1, 5, 4, 5, 1]) == 10)
test("container_with_most_water: includes zero height", container_with_most_water([0, 2, 0]) == 0)

heights = [1] * 10000
heights[0] = 10000
heights[9999] = 10000
test("container_with_most_water: tall walls at the ends of a large list", container_with_most_water(heights) == 10000 * 9999)

# ── three_sum ──
r = sorted_triplets(three_sum([-1, 0, 1, 2, -1, -4]))
test("three_sum: classic example", r == sorted_triplets([[-1, -1, 2], [-1, 0, 1]]), f"got {r}")

test("three_sum: no valid triplets", three_sum([0, 1, 1]) == [])
test("three_sum: all zeros", sorted_triplets(three_sum([0, 0, 0])) == [[0, 0, 0]])
test("three_sum: many zeros still one triplet", sorted_triplets(three_sum([0, 0, 0, 0, 0])) == [[0, 0, 0]])

r = sorted_triplets(three_sum([-2, 0, 0, 2, 2]))
test("three_sum: heavy duplicates yield one triplet", r == [[-2, 0, 2]], f"got {r}")

test("three_sum: empty list", three_sum([]) == [])
test("three_sum: two elements", three_sum([0, 0]) == [])
test("three_sum: all positive no solution", three_sum([1, 2, 3, 4]) == [])
test("three_sum: all negative no solution", three_sum([-4, -3, -2, -1]) == [])

r = sorted_triplets(three_sum([-5, 1, 4, 2, 3, 0]))
test("three_sum: multiple triplets sharing a pivot", r == sorted_triplets([[-5, 1, 4], [-5, 2, 3]]), f"got {r}")

r = sorted_triplets(three_sum([-25, 10, 15, 2, -12, 100]))
test("three_sum: sort must be numeric (values > 9)", r == [[-25, 10, 15], [-12, 2, 10]], f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
