import sys
from stub import is_valid_parentheses, daily_temperatures, largest_rectangle_in_histogram

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


# is_valid_parentheses
test("parens: simple ()", is_valid_parentheses("()") is True)
test("parens: all types", is_valid_parentheses("()[]{}")  is True)
test("parens: nested {[]}", is_valid_parentheses("{[]}") is True)
test("parens: mismatched (]", is_valid_parentheses("(]") is False)
test("parens: interleaved ([)]", is_valid_parentheses("([)]") is False)
test("parens: empty string", is_valid_parentheses("") is True)
test("parens: unclosed open", is_valid_parentheses("(") is False)
test("parens: close without open", is_valid_parentheses(")") is False)
test("parens: deeply nested ((()))", is_valid_parentheses("((()))") is True)

# daily_temperatures
r = daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73])
test("temps: standard", r == [1, 1, 4, 2, 1, 1, 0, 0], f"got {r}")
r = daily_temperatures([30, 40, 50, 60])
test("temps: increasing", r == [1, 1, 1, 0], f"got {r}")
r = daily_temperatures([30, 60, 90])
test("temps: three ascending", r == [1, 1, 0], f"got {r}")
r = daily_temperatures([90, 80, 70, 60])
test("temps: decreasing", r == [0, 0, 0, 0], f"got {r}")
r = daily_temperatures([70])
test("temps: single day", r == [0], f"got {r}")
r = daily_temperatures([55, 55, 55])
test("temps: all equal", r == [0, 0, 0], f"got {r}")

# largest_rectangle_in_histogram
r = largest_rectangle_in_histogram([2, 1, 5, 6, 2, 3])
test("histogram: standard (expect 10)", r == 10, f"got {r}")
r = largest_rectangle_in_histogram([2, 4])
test("histogram: two bars (expect 4)", r == 4, f"got {r}")
r = largest_rectangle_in_histogram([1])
test("histogram: single bar (expect 1)", r == 1, f"got {r}")
r = largest_rectangle_in_histogram([6, 6, 6])
test("histogram: all equal (expect 18)", r == 18, f"got {r}")
r = largest_rectangle_in_histogram([1, 2, 3, 4, 5])
test("histogram: increasing (expect 9)", r == 9, f"got {r}")
r = largest_rectangle_in_histogram([5, 4, 3, 2, 1])
test("histogram: decreasing (expect 9)", r == 9, f"got {r}")
r = largest_rectangle_in_histogram([0, 0, 0])
test("histogram: all zeros (expect 0)", r == 0, f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
