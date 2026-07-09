import sys
from stub import min_mutation, ladder_length

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


# -- min_mutation --
test("min_mutation: single mutation", lambda: assert_eq(
    min_mutation("AACCGGTT", "AACCGGTA", ["AACCGGTA"]), 1))
test("min_mutation: two mutations through the bank", lambda: assert_eq(
    min_mutation("AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA", "AAACGGTA"]), 2))
test("min_mutation: start equals end is 0 even with an empty bank", lambda: assert_eq(
    min_mutation("AACCGGTT", "AACCGGTT", []), 0))
test("min_mutation: end gene missing from the bank", lambda: assert_eq(
    min_mutation("AACCGGTT", "AACCGGTA", []), -1))
test("min_mutation: end in bank but unreachable", lambda: assert_eq(
    min_mutation("AACCTTGG", "AATTCCGG",
                 ["AATTCCGG", "AACCTGGG", "AACCCCGG", "AACCTACC"]), -1))


def _shortest_route():
    bank = ["AAAAAAAT", "AAAAAATT", "AAAAAAAC", "AAAAAACT", "AAAAACTT"]
    assert_eq(min_mutation("AAAAAAAA", "AAAAAATT", bank), 2)


test("min_mutation: takes the shortest of several routes", _shortest_route)


def _one_step():
    bank = ["AACCGGTA", "AACCGGAT", "AACCGGAA"]
    assert_eq(min_mutation("AACCGGTT", "AACCGGTA", bank), 1)


test("min_mutation: one-step answer ignores longer paths", _one_step)

# -- ladder_length --
test("ladder_length: classic five-word ladder", lambda: assert_eq(
    ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]), 5))
test("ladder_length: end word missing from the list", lambda: assert_eq(
    ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log"]), 0))
test("ladder_length: adjacent single-letter words", lambda: assert_eq(
    ladder_length("a", "c", ["a", "b", "c"]), 2))
test("ladder_length: both words listed but no bridge exists", lambda: assert_eq(
    ladder_length("hot", "dog", ["hot", "dog"]), 0))
test("ladder_length: three-word chain through one intermediate", lambda: assert_eq(
    ladder_length("hot", "dog", ["hot", "dog", "dot"]), 3))
test("ladder_length: begin word need not be in the list", lambda: assert_eq(
    ladder_length("red", "tad", ["ted", "tad"]), 3))
test("ladder_length: two equally short routes still return the length", lambda: assert_eq(
    ladder_length("hit", "cog", ["hot", "lot", "dot", "log", "dog", "cog"]), 5))

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
