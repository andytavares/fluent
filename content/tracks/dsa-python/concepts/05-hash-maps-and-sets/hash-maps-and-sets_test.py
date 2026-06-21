import sys
from stub import two_sum, group_anagrams, longest_consecutive_sequence

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


def normalize_groups(groups: list[list[str]]) -> list[list[str]]:
    return sorted(sorted(g) for g in groups)


# two_sum
r = two_sum([2, 7, 11, 15], 9)
test("two_sum: standard", r == (0, 1), f"got {r}")
r = two_sum([3, 2, 4], 6)
test("two_sum: non-adjacent", r == (1, 2), f"got {r}")
r = two_sum([3, 3], 6)
test("two_sum: duplicate values", r == (0, 1), f"got {r}")
r = two_sum([1, 2, 3], 10)
test("two_sum: no solution", r is None, f"got {r}")
r = two_sum([], 5)
test("two_sum: empty", r is None, f"got {r}")
r = two_sum([-3, 4, 3, 90], 0)
test("two_sum: negative+positive", r == (0, 2), f"got {r}")

# group_anagrams
r = normalize_groups(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
e = normalize_groups([["eat", "tea", "ate"], ["tan", "nat"], ["bat"]])
test("anagrams: standard", r == e, f"got {r}")
r = normalize_groups(group_anagrams([""]))
test("anagrams: empty string", r == [[""]], f"got {r}")
r = normalize_groups(group_anagrams(["a"]))
test("anagrams: single char", r == [["a"]], f"got {r}")
r = normalize_groups(group_anagrams(["abc", "bca", "cab", "xyz", "zyx"]))
e = normalize_groups([["abc", "bca", "cab"], ["xyz", "zyx"]])
test("anagrams: two groups", r == e, f"got {r}")
r = normalize_groups(group_anagrams(["a", "b", "c"]))
test("anagrams: no anagrams", r == [["a"], ["b"], ["c"]], f"got {r}")

# longest_consecutive_sequence
r = longest_consecutive_sequence([100, 4, 200, 1, 3, 2])
test("consecutive: standard", r == 4, f"got {r}")
r = longest_consecutive_sequence([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])
test("consecutive: long run with duplicate", r == 9, f"got {r}")
r = longest_consecutive_sequence([])
test("consecutive: empty", r == 0, f"got {r}")
r = longest_consecutive_sequence([1])
test("consecutive: single element", r == 1, f"got {r}")
r = longest_consecutive_sequence([1, 2, 3, 4, 5])
test("consecutive: already sequential", r == 5, f"got {r}")
r = longest_consecutive_sequence([5, 1, 9, 3])
test("consecutive: no sequence longer than 1", r == 1, f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
