import sys
from stub import longest_unique_substring, max_sum_subarray, min_window_substring

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


# longest_unique_substring
r = longest_unique_substring("abcabcbb")
test("unique: abcabcbb", r == 3, f"got {r}")
r = longest_unique_substring("bbbbb")
test("unique: all same", r == 1, f"got {r}")
r = longest_unique_substring("pwwkew")
test("unique: pwwkew", r == 3, f"got {r}")
r = longest_unique_substring("")
test("unique: empty", r == 0, f"got {r}")
r = longest_unique_substring("a")
test("unique: single char", r == 1, f"got {r}")
r = longest_unique_substring("abcdefg")
test("unique: all distinct", r == 7, f"got {r}")
r = longest_unique_substring("dvdf")
test("unique: dvdf", r == 3, f"got {r}")

# max_sum_subarray
r = max_sum_subarray([2, 1, 5, 1, 3, 2], 3)
test("max_sum: k=3", r == 9, f"got {r}")
r = max_sum_subarray([2, 3, 4, 1, 5], 2)
test("max_sum: k=2", r == 7, f"got {r}")
r = max_sum_subarray([1, 2, 3, 4, 5], 5)
test("max_sum: k=length", r == 15, f"got {r}")
r = max_sum_subarray([5, 1, 1, 1, 1], 1)
test("max_sum: k=1", r == 5, f"got {r}")
r = max_sum_subarray([-1, -2, -3, -4], 2)
test("max_sum: all negative", r == -3, f"got {r}")

# min_window_substring
r = min_window_substring("ADOBECODEBANC", "ABC")
test("min_window: ADOBECODEBANC/ABC", r == "BANC", f"got {r!r}")
r = min_window_substring("a", "a")
test("min_window: exact match", r == "a", f"got {r!r}")
r = min_window_substring("a", "b")
test("min_window: no match", r == "", f"got {r!r}")
r = min_window_substring("", "a")
test("min_window: empty s", r == "", f"got {r!r}")
r = min_window_substring("aa", "aa")
test("min_window: duplicate in t", r == "aa", f"got {r!r}")
r = min_window_substring("cabwefgewcwaefgcf", "cae")
test("min_window: longer string", r == "cwae", f"got {r!r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
