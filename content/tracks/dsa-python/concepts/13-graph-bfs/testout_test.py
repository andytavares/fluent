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
test("min_mutation: start equals end is 0 with a populated bank", lambda: assert_eq(
    min_mutation("AACCGGTT", "AACCGGTT", ["AACCGGTA"]), 0))
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


def _eight_step_chain():
    bank = ["T" * i + "A" * (8 - i) for i in range(1, 9)]
    assert_eq(min_mutation("AAAAAAAA", "TTTTTTTT", bank), 8)


test("min_mutation: eight-step chain flips every position", _eight_step_chain)


def _decoy_branches():
    bank = [
        "TAAAAAAA", "TTAAAAAA", "TTTAAAAA", "TTTTAAAA",  # real path prefix
        "CAAAAAAA", "CCAAAAAA", "CCCAAAAA",              # dead-end branch
        "GAAAAAAA", "GGAAAAAA",                          # another dead end
    ]
    assert_eq(min_mutation("AAAAAAAA", "TTTTAAAA", bank), 4)


test("min_mutation: decoy branches do not distract the search", _decoy_branches)

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


def _long_chain_with_decoy():
    # Build a path from "aaaa" to "zzzz": flip position 0..3 to the next
    # letter, one flip per step -- 100 edges, 101 words.
    words = []
    current = ["a", "a", "a", "a"]
    for code in range(ord("b"), ord("z") + 1):
        for pos in range(4):
            current[pos] = chr(code)
            words.append("".join(current))

    # Decoy cluster: c1 + "zz" + c2 -- ~674 words that attach to the chain
    # only at "zzzy"/"zzzz" (its very last edge), so wandering into them can
    # never shorten the ladder. BFS must not get lost in the branching.
    chain_set = set(words)
    for a in range(ord("a"), ord("z") + 1):
        for b in range(ord("a"), ord("z") + 1):
            w = chr(a) + "zz" + chr(b)
            if w not in chain_set:
                words.append(w)

    assert_eq(ladder_length("aaaa", "zzzz", words), 101)


test("ladder_length: 101-word chain with a decoy cluster", _long_chain_with_decoy)


def _large_unreachable():
    # 600+ words, none of which connect "mmmm" to "zzzz"
    words = ["zzzz"]
    for a in range(ord("a"), ord("t") + 1):
        for b in range(ord("a"), ord("t") + 1):
            words.append("a" + chr(a) + chr(b) + "b")
    assert_eq(ladder_length("mmmm", "zzzz", words), 0)


test("ladder_length: large unreachable list returns 0 quickly", _large_unreachable)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
