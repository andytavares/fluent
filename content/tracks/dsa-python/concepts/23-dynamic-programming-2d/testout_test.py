from stub import (
    min_path_sum,
    unique_paths_with_obstacles,
    longest_palindrome,
    min_distance,
    maximal_square,
)

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


def check_longest_palindrome(s: str, expected_len: int) -> str:
    result = longest_palindrome(s)
    if not isinstance(result, str):
        return f"expected a string, got {type(result)}"
    if len(result) != expected_len:
        return f"expected a palindrome of length {expected_len}, got '{result}' (length {len(result)})"
    if result not in s:
        return f"'{result}' is not a substring of '{s}'"
    if result != result[::-1]:
        return f"'{result}' is not a palindrome"
    return ""


# ── min_path_sum ──
r = min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])
test("min_path_sum: classic 3x3", r == 7, f"got {r}")

r = min_path_sum([[1, 2, 3], [4, 5, 6]])
test("min_path_sum: 2x3 grid", r == 12, f"got {r}")

r = min_path_sum([[3]])
test("min_path_sum: single cell", r == 3, f"got {r}")

r = min_path_sum([[1, 2, 3, 4]])
test("min_path_sum: single row is a forced path", r == 10, f"got {r}")

r = min_path_sum([[1], [2], [3]])
test("min_path_sum: single column is a forced path", r == 6, f"got {r}")

r = min_path_sum([[0, 0, 9], [9, 0, 0]])
test("min_path_sum: zeros in the grid", r == 0, f"got {r}")

r = min_path_sum([[1, 9, 9], [1, 9, 9], [1, 1, 1]])
test("min_path_sum: cheap detour beats direct diagonal-ish route", r == 5, f"got {r}")

# ── unique_paths_with_obstacles ──
r = unique_paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]])
test("unique_paths_with_obstacles: obstacle in the middle", r == 2, f"got {r}")

r = unique_paths_with_obstacles([[0, 1], [0, 0]])
test("unique_paths_with_obstacles: 2x2 with one obstacle", r == 1, f"got {r}")

r = unique_paths_with_obstacles([[1]])
test("unique_paths_with_obstacles: blocked start", r == 0, f"got {r}")

r = unique_paths_with_obstacles([[0]])
test("unique_paths_with_obstacles: open single cell", r == 1, f"got {r}")

r = unique_paths_with_obstacles([[0, 0], [0, 1]])
test("unique_paths_with_obstacles: blocked goal", r == 0, f"got {r}")

r = unique_paths_with_obstacles([[0, 1, 0], [0, 1, 0], [0, 1, 0]])
test("unique_paths_with_obstacles: obstacle wall cuts the grid", r == 0, f"got {r}")

grid = [[0] * 7 for _ in range(3)]
r = unique_paths_with_obstacles(grid)
test("unique_paths_with_obstacles: no obstacles — pure counting", r == 28, f"got {r}")

r = unique_paths_with_obstacles([[0, 1, 0]])
test("unique_paths_with_obstacles: obstacle in a single row", r == 0, f"got {r}")

# ── longest_palindrome ──
detail = check_longest_palindrome("babad", 3)
test("longest_palindrome: babad — two valid answers", detail == "", detail)

r = longest_palindrome("cbbd")
test("longest_palindrome: even-length palindrome", r == "bb", f"got {r}")

r = longest_palindrome("a")
test("longest_palindrome: single character", r == "a", f"got {r}")

detail = check_longest_palindrome("ac", 1)
test("longest_palindrome: no palindrome longer than 1", detail == "", detail)

r = longest_palindrome("racecar")
test("longest_palindrome: whole string", r == "racecar", f"got {r}")

r = longest_palindrome("forgeeksskeegfor")
test("longest_palindrome: even palindrome mid-string", r == "geeksskeeg", f"got {r}")

r = longest_palindrome("aaaa")
test("longest_palindrome: repeated character block", r == "aaaa", f"got {r}")

detail = check_longest_palindrome("aacabdkacaa", 3)
test("longest_palindrome: near-palindromic ends trap", detail == "", detail)

# ── min_distance ──
r = min_distance("horse", "ros")
test("min_distance: classic horse/ros", r == 3, f"got {r}")

r = min_distance("intention", "execution")
test("min_distance: intention/execution", r == 5, f"got {r}")

r = min_distance("", "abc")
test("min_distance: empty source", r == 3, f"got {r}")

r = min_distance("abc", "")
test("min_distance: empty target", r == 3, f"got {r}")

r = min_distance("", "")
test("min_distance: both empty", r == 0, f"got {r}")

r = min_distance("abc", "abc")
test("min_distance: equal strings", r == 0, f"got {r}")

r = min_distance("ab", "ba")
test("min_distance: transposition costs 2 — no swap op", r == 2, f"got {r}")

r = min_distance("aaa", "bbbbb")
test("min_distance: disjoint alphabets", r == 5, f"got {r}")

# ── maximal_square ──
matrix = [
    ["1", "0", "1", "0", "0"],
    ["1", "0", "1", "1", "1"],
    ["1", "1", "1", "1", "1"],
    ["1", "0", "0", "1", "0"],
]
r = maximal_square(matrix)
test("maximal_square: classic 4x5", r == 4, f"got {r}")

r = maximal_square([["0", "1"], ["1", "0"]])
test("maximal_square: only single ones", r == 1, f"got {r}")

r = maximal_square([["0"]])
test("maximal_square: all zeros", r == 0, f"got {r}")

r = maximal_square([["1"]])
test("maximal_square: single one", r == 1, f"got {r}")

matrix = [["1"] * 4 for _ in range(3)]
r = maximal_square(matrix)
test("maximal_square: rectangle of ones capped by shorter side", r == 9, f"got {r}")

matrix = [["1"] * 3 for _ in range(3)]
r = maximal_square(matrix)
test("maximal_square: full ones matrix", r == 9, f"got {r}")

r = maximal_square([["1", "1"], ["1", "1"]])
test("maximal_square: string cells — '1' the character, not the number", r == 4, f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
