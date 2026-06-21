import sys
from stub import unique_paths, longest_common_subsequence, edit_distance

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


# unique_paths tests
result = unique_paths(3, 7)
test("paths: 3x7", result == 28, f"got {result}, want 28")

result = unique_paths(3, 2)
test("paths: 3x2", result == 3, f"got {result}, want 3")

result = unique_paths(1, 1)
test("paths: 1x1", result == 1, f"got {result}, want 1")

result = unique_paths(1, 5)
test("paths: 1xN (single row)", result == 1, f"got {result}, want 1")

result = unique_paths(5, 1)
test("paths: Mx1 (single col)", result == 1, f"got {result}, want 1")

result = unique_paths(2, 2)
test("paths: 2x2", result == 2, f"got {result}, want 2")

result = unique_paths(4, 4)
test("paths: 4x4", result == 20, f"got {result}, want 20")

# longest_common_subsequence tests
result = longest_common_subsequence("abcde", "ace")
test("lcs: abcde/ace", result == 3, f"got {result}, want 3")

result = longest_common_subsequence("abc", "abc")
test("lcs: identical strings", result == 3, f"got {result}, want 3")

result = longest_common_subsequence("abc", "def")
test("lcs: no common", result == 0, f"got {result}, want 0")

result = longest_common_subsequence("", "abc")
test("lcs: empty first string", result == 0, f"got {result}, want 0")

result = longest_common_subsequence("abc", "")
test("lcs: empty second string", result == 0, f"got {result}, want 0")

result = longest_common_subsequence("oxcpqrsvwf", "shmtulqrypy")
test("lcs: longer strings", result == 2, f"got {result}, want 2")

# edit_distance tests
result = edit_distance("horse", "ros")
test("edit: horse->ros", result == 3, f"got {result}, want 3")

result = edit_distance("intention", "execution")
test("edit: intention->execution", result == 5, f"got {result}, want 5")

result = edit_distance("", "abc")
test("edit: empty->abc", result == 3, f"got {result}, want 3")

result = edit_distance("abc", "")
test("edit: abc->empty", result == 3, f"got {result}, want 3")

result = edit_distance("abc", "abc")
test("edit: identical", result == 0, f"got {result}, want 0")

result = edit_distance("a", "b")
test("edit: single char replace", result == 1, f"got {result}, want 1")

result = edit_distance("kitten", "sitting")
test("edit: kitten->sitting", result == 3, f"got {result}, want 3")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
