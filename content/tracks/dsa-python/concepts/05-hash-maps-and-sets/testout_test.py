from stub import is_anagram, group_anagrams, two_sum, longest_consecutive

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


def sort_groups(groups: list[list[str]]) -> list[list[str]]:
    return sorted((sorted(g) for g in groups), key=lambda g: " ".join(g))


# ── is_anagram ──
test("is_anagram: classic anagram", is_anagram("anagram", "nagaram") is True)
test("is_anagram: same letters, wrong counts", is_anagram("rat", "car") is False)
test("is_anagram: different lengths", is_anagram("ab", "a") is False)
test("is_anagram: empty strings", is_anagram("", "") is True)
test("is_anagram: identical strings", is_anagram("abc", "abc") is True)
test("is_anagram: multiplicities differ, same character set", is_anagram("aacc", "ccac") is False)
test("is_anagram: case-sensitive comparison", is_anagram("Abc", "abc") is False)
test("is_anagram: single characters", is_anagram("a", "a") is True and is_anagram("a", "b") is False)

s = "abcdefghij" * 2000
t = s[::-1]
test("is_anagram: long shuffled string is an anagram", is_anagram(s, t) is True)

t2 = t.replace("a", "z", 1)
test("is_anagram: long strings differing by one character", is_anagram(s, t2) is False)

# ── group_anagrams ──
r = sort_groups(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
expected = sort_groups([["eat", "tea", "ate"], ["tan", "nat"], ["bat"]])
test("group_anagrams: classic example", r == expected, f"got {r}")

test("group_anagrams: empty input list", group_anagrams([]) == [])
test("group_anagrams: single empty string", group_anagrams([""]) == [[""]])
test("group_anagrams: single string", group_anagrams(["a"]) == [["a"]])

r = sort_groups(group_anagrams(["ab", "ba", "ab"]))
test("group_anagrams: duplicate strings land in one group", r == [["ab", "ab", "ba"]], f"got {r}")

r = sort_groups(group_anagrams(["", "b", ""]))
test("group_anagrams: multiple empty strings group together", r == sort_groups([["", ""], ["b"]]), f"got {r}")

r = sort_groups(group_anagrams(["ab", "cd", "ef"]))
test(
    "group_anagrams: no anagram partners — all singleton groups",
    r == sort_groups([["ab"], ["cd"], ["ef"]]),
    f"got {r}",
)

word = "abcde"
rotations = [word[i:] + word[:i] for i in range(5)]
result = group_anagrams(rotations)
test(
    "group_anagrams: many rotations of one word form a single group",
    len(result) == 1 and sorted(result[0]) == sorted(rotations),
)

strs = []
for i in range(500):
    strs.append("abc" if i % 2 == 0 else "cba")
for i in range(500):
    strs.append("xyz" if i % 2 == 0 else "zyx")
result = group_anagrams(strs)
test(
    "group_anagrams: 1000 strings across two groups",
    len(result) == 2 and sorted(len(g) for g in result) == [500, 500],
)

# ── two_sum ──
test("two_sum: classic example", two_sum([2, 7, 11, 15], 9) == [0, 1])
test("two_sum: pair not at the front", two_sum([3, 2, 4], 6) == [1, 2])
test("two_sum: duplicate values form the pair", two_sum([3, 3], 6) == [0, 1])
test("two_sum: negative numbers", two_sum([-3, 4, 90], 1) == [0, 1])
test("two_sum: target zero", two_sum([5, -7, 2, 7], 0) == [1, 3])
test("two_sum: pair at the two ends", two_sum([1, 9, 4, 7, 5], 6) == [0, 4])

nums = [i * 2 for i in range(100000)]  # evens
nums[99999] = 99999  # the only odd value
test("two_sum: large list, pair deep inside", two_sum(nums, 99999 + 50000) == [25000, 99999])

# ── longest_consecutive ──
test("longest_consecutive: classic example", longest_consecutive([100, 4, 200, 1, 3, 2]) == 4)
test("longest_consecutive: longer run with duplicates", longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9)
test("longest_consecutive: empty list", longest_consecutive([]) == 0)
test("longest_consecutive: single element", longest_consecutive([7]) == 1)
test("longest_consecutive: no consecutive values", longest_consecutive([10, 20, 30]) == 1)
test("longest_consecutive: run crossing zero with negatives", longest_consecutive([-2, 1, -1, 0]) == 4)
test("longest_consecutive: duplicates inside a run don't lengthen it", longest_consecutive([1, 2, 2, 3]) == 3)

n = 50000
nums = list(range(n))
seed = 42
for i in range(n - 1, 0, -1):
    seed = (seed * 1103515245 + 12345) % 2147483648
    j = seed % (i + 1)
    nums[i], nums[j] = nums[j], nums[i]
test("longest_consecutive: one 50k-element run, shuffled — punishes O(n^2)", longest_consecutive(nums) == n)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
