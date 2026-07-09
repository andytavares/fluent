from stub import is_valid, MinStack, eval_rpn

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


# ── is_valid ──
test("is_valid: single pair", is_valid("()") is True)
test("is_valid: all three types in sequence", is_valid("()[]{}") is True)
test("is_valid: wrong closer type", is_valid("(]") is False)
test("is_valid: interleaved (not nested)", is_valid("([)]") is False)
test("is_valid: proper nesting", is_valid("{[]}") is True)
test("is_valid: lone opener", is_valid("(") is False)
test("is_valid: lone closer", is_valid(")") is False)
test("is_valid: empty string", is_valid("") is True)
test("is_valid: leftover openers", is_valid("(()") is False)
test("is_valid: closer arrives with empty stack mid-string", is_valid("()]") is False)
test("is_valid: deep nesting", is_valid("({[({[]})]})") is True)

s = "([{" * 20000 + "}])" * 20000
test("is_valid: 20k-deep nesting is valid", is_valid(s) is True)

s = "()" * 10000 + "[" + "()" * 10000 + ")"
test("is_valid: long valid string with one flipped closer", is_valid(s) is False)

# ── MinStack ──
st = MinStack()
st.push(-2)
st.push(0)
st.push(-3)
ok = st.get_min() == -3
st.pop()
ok = ok and st.top() == 0 and st.get_min() == -2
test("MinStack: classic push/pop/get_min sequence", ok)

st = MinStack()
st.push(5)
st.push(1)
ok = st.get_min() == 1
st.pop()
ok = ok and st.get_min() == 5
test("MinStack: popping the minimum restores the previous one", ok)

st = MinStack()
st.push(2)
st.push(2)
st.push(7)
st.pop()
st.pop()
test("MinStack: duplicate minimums survive one pop", st.get_min() == 2 and st.top() == 2)

st = MinStack()
st.push(42)
test("MinStack: single element — top and min agree", st.top() == 42 and st.get_min() == 42)

st = MinStack()
st.push(1)
st.push(2)
st.push(3)
test("MinStack: ascending pushes keep the first min", st.get_min() == 1 and st.top() == 3)

st = MinStack()
st.push(3)
st.push(1)
st.pop()
st.push(2)
ok = st.get_min() == 2
st.push(0)
ok = ok and st.get_min() == 0
st.pop()
ok = ok and st.get_min() == 2 and st.top() == 2
test("MinStack: interleaved push/pop", ok)

a = MinStack()
b = MinStack()
a.push(1)
b.push(9)
test("MinStack: two independent instances don't share state", a.get_min() == 1 and b.get_min() == 9)

st = MinStack()
for v in range(100, 0, -1):
    st.push(v)  # each push is a new min
ok = st.get_min() == 1
for v in range(1, 100):
    ok = ok and st.top() == v and st.get_min() == v
    st.pop()
ok = ok and st.top() == 100 and st.get_min() == 100
test("MinStack: descending pushes then full unwind", ok)

st = MinStack()
seed = 7
mins: list[int] = []
ok = True
for i in range(100000):
    seed = (seed * 1103515245 + 12345) % 2147483648
    v = seed % 100000
    current_min = v if not mins else min(v, mins[-1])
    mins.append(current_min)
    st.push(v)
    ok = ok and st.get_min() == current_min
for i in range(50000):
    st.pop()
ok = ok and st.get_min() == mins[49999]
test("MinStack: 100k operations with get_min at every step", ok)

# ── eval_rpn ──
test("eval_rpn: classic example", eval_rpn(["2", "1", "+", "3", "*"]) == 9)
test("eval_rpn: division truncates", eval_rpn(["4", "13", "5", "/", "+"]) == 6)
test("eval_rpn: single token", eval_rpn(["18"]) == 18)
test("eval_rpn: single negative token", eval_rpn(["-5"]) == -5)
test("eval_rpn: subtraction operand order", eval_rpn(["7", "3", "-"]) == 4)
test("eval_rpn: division operand order", eval_rpn(["8", "2", "/"]) == 4)
test("eval_rpn: negative operand token", eval_rpn(["-11", "5", "+"]) == -6)
test("eval_rpn: truncation toward zero on negative quotient", eval_rpn(["-7", "3", "/"]) == -2)
test("eval_rpn: truncation toward zero, negative divisor", eval_rpn(["6", "-4", "/"]) == -1)
test(
    "eval_rpn: long mixed expression",
    eval_rpn(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]) == 22,
)

tokens = ["1"]
for _ in range(9999):
    tokens.extend(["1", "+"])
test("eval_rpn: 10k-term running sum", eval_rpn(tokens) == 10000)

tokens = ["1"] * 1000 + ["-"] * 999
test("eval_rpn: deep operand stack before any operator", eval_rpn(tokens) == 0)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
