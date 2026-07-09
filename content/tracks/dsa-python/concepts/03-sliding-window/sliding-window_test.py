from stub import min_sub_array_len, length_of_longest_substring, min_window

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


# ── min_sub_array_len ──
test("min_sub_array_len: classic example", min_sub_array_len(7, [2, 3, 1, 2, 4, 3]) == 2)
test("min_sub_array_len: single element suffices", min_sub_array_len(4, [1, 4, 4]) == 1)
test("min_sub_array_len: no subarray reaches target", min_sub_array_len(11, [1, 1, 1, 1, 1, 1, 1, 1]) == 0)
test("min_sub_array_len: whole list sums exactly to target", min_sub_array_len(6, [1, 2, 3]) == 3)
test("min_sub_array_len: single-element list meets target", min_sub_array_len(5, [5]) == 1)
test("min_sub_array_len: single-element list misses target", min_sub_array_len(6, [5]) == 0)
test("min_sub_array_len: empty list", min_sub_array_len(1, []) == 0)
test("min_sub_array_len: best window in the middle", min_sub_array_len(8, [1, 1, 7, 1, 1, 1]) == 2)
test("min_sub_array_len: shrink past several small elements", min_sub_array_len(15, [1, 2, 3, 4, 5]) == 5)
test(
    "min_sub_array_len: large value late beats long early window",
    min_sub_array_len(10, [1, 1, 1, 1, 1, 1, 1, 1, 10]) == 1,
)

# ── length_of_longest_substring ──
test("length_of_longest_substring: classic example", length_of_longest_substring("abcabcbb") == 3)
test("length_of_longest_substring: all identical", length_of_longest_substring("bbbbb") == 1)
test("length_of_longest_substring: substring not subsequence", length_of_longest_substring("pwwkew") == 3)
test("length_of_longest_substring: empty string", length_of_longest_substring("") == 0)
test("length_of_longest_substring: single character", length_of_longest_substring("z") == 1)
test("length_of_longest_substring: all distinct", length_of_longest_substring("abcdef") == 6)
test(
    "length_of_longest_substring: stale index must not move left backwards",
    length_of_longest_substring("abba") == 2,
)
test("length_of_longest_substring: duplicate before current window", length_of_longest_substring("tmmzuxt") == 5)
test("length_of_longest_substring: repeat forces partial jump", length_of_longest_substring("dvdf") == 3)
test(
    "length_of_longest_substring: spaces and symbols count as characters",
    length_of_longest_substring("a b!a") == 4,
)

# ── min_window ──
test("min_window: classic example", min_window("ADOBECODEBANC", "ABC") == "BANC")
test("min_window: single char match", min_window("a", "a") == "a")
test("min_window: t longer than s", min_window("a", "aa") == "")
test("min_window: duplicates in t both required", min_window("aa", "aa") == "aa")
test("min_window: no valid window", min_window("abc", "d") == "")
test("min_window: window at the very start", min_window("abcde", "ab") == "ab")
test("min_window: window at the very end", min_window("abcde", "de") == "de")
test("min_window: whole of s is the only valid window", min_window("acb", "abc") == "acb")
test("min_window: must keep shrinking to the tightest window", min_window("cabwefgewcwaefgcf", "cae") == "cwae")
test("min_window: duplicate requirement stops premature shrink", min_window("abcdefa", "aa") == "abcdefa")
test("min_window: case sensitivity", min_window("Aa", "A") == "A")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
