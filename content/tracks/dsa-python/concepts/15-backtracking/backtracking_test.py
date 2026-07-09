import sys
from stub import letter_combinations, permute, combination_sum, generate_parenthesis

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


def sort_combos(arr):
    return sorted(sorted(c) for c in arr)


def sort_perms(arr):
    return sorted(list(p) for p in arr)


# -- letter_combinations --
test("letter_combinations: classic '23'", lambda: assert_eq(
    sorted(letter_combinations("23")),
    ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]))
test('letter_combinations: empty input returns [] (not [""])', lambda: assert_eq(
    letter_combinations(""), []))
test("letter_combinations: single digit", lambda: assert_eq(
    sorted(letter_combinations("2")), ["a", "b", "c"]))
test("letter_combinations: four-letter digit 7", lambda: assert_eq(
    sorted(letter_combinations("7")), ["p", "q", "r", "s"]))


def _double_four_letter():
    result = sorted(letter_combinations("79"))
    expected = sorted(a + b for a in "pqrs" for b in "wxyz")
    assert_eq(result, expected)


test('letter_combinations: two four-letter digits "79" -> 16 combos', _double_four_letter)


def _three_digits():
    result = letter_combinations("234")
    assert_eq(len(result), 27)
    for s in result:
        assert_eq(len(s), 3)
    assert_eq(len(set(result)), 27)


test("letter_combinations: three digits -> 27 strings of length 3", _three_digits)


# -- permute --
def _classic_permute():
    expected = sort_perms([[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]])
    assert_eq(sort_perms(permute([1, 2, 3])), expected)


test("permute: classic [1,2,3]", _classic_permute)
test("permute: two elements", lambda: assert_eq(
    sort_perms(permute([0, 1])), [[0, 1], [1, 0]]))
test("permute: single element", lambda: assert_eq(permute([1]), [[1]]))
test("permute: negative values", lambda: assert_eq(
    sort_perms(permute([-1, 5])), [[-1, 5], [5, -1]]))


def _independent_lists():
    result = permute([1, 2])
    result[0].append(999)
    assert_eq(len(result[1]), 2)


test("permute: results are independent lists (no shared reference)", _independent_lists)

# -- combination_sum --
test("combination_sum: classic [2,3,6,7] target 7", lambda: assert_eq(
    sort_combos(combination_sum([2, 3, 6, 7], 7)), sort_combos([[2, 2, 3], [7]])))
test("combination_sum: [2,3,5] target 8", lambda: assert_eq(
    sort_combos(combination_sum([2, 3, 5], 8)),
    sort_combos([[2, 2, 2, 2], [2, 3, 3], [3, 5]])))
test("combination_sum: no solution returns []", lambda: assert_eq(
    combination_sum([2], 1), []))
test("combination_sum: candidate equal to target", lambda: assert_eq(
    sort_combos(combination_sum([5], 5)), [[5]]))
test("combination_sum: deep reuse of a single candidate", lambda: assert_eq(
    sort_combos(combination_sum([2], 8)), [[2, 2, 2, 2]]))
test("combination_sum: unsorted input", lambda: assert_eq(
    sort_combos(combination_sum([7, 6, 3, 2], 7)), sort_combos([[2, 2, 3], [7]])))


def _no_dupes():
    result = combination_sum([2, 3], 5)
    assert_eq(sort_combos(result), [[2, 3]])


test("combination_sum: no duplicate combinations in different orders", _no_dupes)

# -- generate_parenthesis --
test("generate_parenthesis: n = 3", lambda: assert_eq(
    sorted(generate_parenthesis(3)),
    sorted(["((()))", "(()())", "(())()", "()(())", "()()()"])))
test("generate_parenthesis: n = 1", lambda: assert_eq(generate_parenthesis(1), ["()"]))
test("generate_parenthesis: n = 2", lambda: assert_eq(
    sorted(generate_parenthesis(2)), sorted(["(())", "()()"])))


def _n4():
    result = generate_parenthesis(4)
    assert_eq(len(result), 14)  # Catalan(4)
    assert_eq(len(set(result)), 14)
    for s in result:
        assert_eq(len(s), 8)
        depth = 0
        for ch in s:
            depth += 1 if ch == "(" else -1
            assert depth >= 0, f"invalid prefix in {s}"
        assert_eq(depth, 0)


test("generate_parenthesis: n = 4 -> 14 distinct valid strings of length 8", _n4)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
