from stub import climb_stairs, rob, word_break, coin_change, length_of_lis

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


# ── climb_stairs ──
r = climb_stairs(1)
test("climb_stairs: one stair", r == 1, f"got {r}")

r = climb_stairs(2)
test("climb_stairs: two stairs", r == 2, f"got {r}")

r = climb_stairs(3)
test("climb_stairs: three stairs", r == 3, f"got {r}")

r = climb_stairs(5)
test("climb_stairs: five stairs", r == 8, f"got {r}")

r = climb_stairs(10)
test("climb_stairs: ten stairs", r == 89, f"got {r}")

r = climb_stairs(45)
test("climb_stairs: forty-five stairs", r == 1836311903, f"got {r}")

# ── rob ──
r = rob([1, 2, 3, 1])
test("rob: classic example", r == 4, f"got {r}")

r = rob([2, 7, 9, 3, 1])
test("rob: skip pattern pays off", r == 12, f"got {r}")

r = rob([])
test("rob: empty street", r == 0, f"got {r}")

r = rob([5])
test("rob: single house", r == 5, f"got {r}")

r = rob([2, 10])
test("rob: two houses take the larger", r == 10, f"got {r}")

r = rob([2, 1, 1, 2])
test("rob: both ends beat every-other", r == 4, f"got {r}")

r = rob([0, 0, 0])
test("rob: all zeros", r == 0, f"got {r}")

# ── word_break ──
r = word_break("leetcode", ["leet", "code"])
test("word_break: two words", r is True, f"got {r}")

r = word_break("applepenapple", ["apple", "pen"])
test("word_break: word reuse", r is True, f"got {r}")

r = word_break("catsandog", ["cats", "dog", "sand", "and", "cat"])
test("word_break: overlapping but unsegmentable", r is False, f"got {r}")

r = word_break("", ["a"])
test("word_break: empty string is segmentable", r is True, f"got {r}")

r = word_break("a", ["b"])
test("word_break: single unmatched char", r is False, f"got {r}")

r = word_break("cars", ["car", "ca", "rs"])
test("word_break: greedy first match dead-ends", r is True, f"got {r}")

r = word_break("aaaa", ["a"])
test("word_break: one word repeated many times", r is True, f"got {r}")

r = word_break("dynamic", ["dynamic"])
test("word_break: whole string is one word", r is True, f"got {r}")

# ── coin_change ──
r = coin_change([1, 2, 5], 11)
test("coin_change: classic example", r == 3, f"got {r}")

r = coin_change([2], 3)
test("coin_change: unreachable amount", r == -1, f"got {r}")

r = coin_change([1], 0)
test("coin_change: zero amount needs zero coins", r == 0, f"got {r}")

r = coin_change([1], 1)
test("coin_change: single coin exact", r == 1, f"got {r}")

r = coin_change([1, 5, 11], 15)
test("coin_change: greedy largest-first fails", r == 3, f"got {r}")

r = coin_change([5, 10], 3)
test("coin_change: coin larger than amount", r == -1, f"got {r}")

r = coin_change([186, 419, 83, 408], 6249)
test("coin_change: big denominations, big amount", r == 20, f"got {r}")

# ── length_of_lis ──
r = length_of_lis([10, 9, 2, 5, 3, 7, 101, 18])
test("length_of_lis: classic example", r == 4, f"got {r}")

r = length_of_lis([0, 1, 0, 3, 2, 3])
test("length_of_lis: values revisited", r == 4, f"got {r}")

r = length_of_lis([7, 7, 7, 7])
test("length_of_lis: all equal — strictness", r == 1, f"got {r}")

r = length_of_lis([])
test("length_of_lis: empty list", r == 0, f"got {r}")

r = length_of_lis([1])
test("length_of_lis: single element", r == 1, f"got {r}")

r = length_of_lis([5, 4, 3, 2, 1])
test("length_of_lis: strictly descending", r == 1, f"got {r}")

r = length_of_lis([1, 2, 3, 4])
test("length_of_lis: strictly ascending", r == 4, f"got {r}")

r = length_of_lis([4, 10, 4, 3, 8, 9])
test("length_of_lis: replacement mid-run", r == 3, f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
