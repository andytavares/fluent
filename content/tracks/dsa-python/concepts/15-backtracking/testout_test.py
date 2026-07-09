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


def _789():
    result = letter_combinations("789")
    assert_eq(len(result), 48)  # 4 x 3 x 4
    assert_eq(len(set(result)), 48)
    for s in result:
        assert_eq(len(s), 3)
        assert s[0] in "pqrs", f"bad first letter in {s}"
        assert s[1] in "tuv", f"bad second letter in {s}"
        assert s[2] in "wxyz", f"bad third letter in {s}"


test('letter_combinations: "789" -> 48 distinct combos from the right menus', _789)

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


def _four_elements():
    result = permute([1, 2, 3, 4])
    assert_eq(len(result), 24)
    assert_eq(len({tuple(p) for p in result}), 24)
    for p in result:
        assert_eq(sorted(p), [1, 2, 3, 4])


test("permute: [1,2,3,4] -> 24 distinct valid permutations", _four_elements)


def _five_elements():
    result = permute([1, 2, 3, 4, 5])
    assert_eq(len(result), 120)
    assert_eq(len({tuple(p) for p in result}), 120)


test("permute: 5 elements -> 120 permutations", _five_elements)

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
test("combination_sum: [2,3,5] target 11 -> four combinations", lambda: assert_eq(
    sort_combos(combination_sum([2, 3, 5], 11)),
    sort_combos([[2, 2, 2, 2, 3], [2, 2, 2, 5], [2, 3, 3, 3], [3, 3, 5]])))


def _larger_target():
    result = combination_sum([3, 5, 7], 30)
    assert len(result) > 0
    seen = set()
    for c in result:
        assert_eq(sum(c), 30)
        key = tuple(sorted(c))
        assert key not in seen, f"duplicate combination {key}"
        seen.add(key)
    # Partitions of 30 into parts {3,5,7}: 3a+5b+7c=30 has exactly 7 solutions
    assert_eq(len(seen), 7)


test("combination_sum: larger target, every combination sums correctly", _larger_target)

# -- generate_parenthesis --
test("generate_parenthesis: n = 3", lambda: assert_eq(
    sorted(generate_parenthesis(3)),
    sorted(["((()))", "(()())", "(())()", "()(())", "()()()"])))
test("generate_parenthesis: n = 1", lambda: assert_eq(generate_parenthesis(1), ["()"]))
test("generate_parenthesis: n = 2", lambda: assert_eq(
    sorted(generate_parenthesis(2)), sorted(["(())", "()()"])))


def _valid_strings(result, expected_len, str_len):
    assert_eq(len(result), expected_len)
    assert_eq(len(set(result)), expected_len)
    for s in result:
        assert_eq(len(s), str_len)
        depth = 0
        for ch in s:
            depth += 1 if ch == "(" else -1
            assert depth >= 0, f"invalid prefix in {s}"
        assert_eq(depth, 0)


test("generate_parenthesis: n = 4 -> 14 distinct valid strings of length 8", lambda: _valid_strings(
    generate_parenthesis(4), 14, 8))
test("generate_parenthesis: n = 6 -> Catalan(6) = 132 distinct valid strings", lambda: _valid_strings(
    generate_parenthesis(6), 132, 12))

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
