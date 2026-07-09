from stub import add_binary, hamming_weight, single_number, range_bitwise_and

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


# ── add_binary ──
r = add_binary("11", "1")
test("add_binary: carry creates an extra digit", r == "100", f"got {r}")

r = add_binary("1010", "1011")
test("add_binary: classic example", r == "10101", f"got {r}")

r = add_binary("0", "0")
test("add_binary: zero plus zero is a single zero", r == "0", f"got {r}")

r = add_binary("0", "1101")
test("add_binary: zero plus something", r == "1101", f"got {r}")

r = add_binary("1111", "1111")
test("add_binary: cascading carries", r == "11110", f"got {r}")

r = add_binary("100", "110010")
test("add_binary: very different lengths", r == "110110", f"got {r}")

r = add_binary("1" * 100, "1")
test("add_binary: 100-digit input — numeric conversion would round", r == "1" + "0" * 100, f"got {r}")

r = add_binary("1" * 80, "1" * 80)
test("add_binary: two long strings", r == "1" * 80 + "0", f"got {r}")

# ── hamming_weight ──
r = hamming_weight(11)
test("hamming_weight: 11 has three set bits", r == 3, f"got {r}")

r = hamming_weight(128)
test("hamming_weight: power of two has one", r == 1, f"got {r}")

r = hamming_weight(0)
test("hamming_weight: zero has none", r == 0, f"got {r}")

r = hamming_weight(1)
test("hamming_weight: one", r == 1, f"got {r}")

r = hamming_weight(2147483648)
test("hamming_weight: bit 31 alone", r == 1, f"got {r}")

r = hamming_weight(4294967293)
test("hamming_weight: all bits except bit 1", r == 31, f"got {r}")

r = hamming_weight(4294967295)
test("hamming_weight: all 32 bits set", r == 32, f"got {r}")

r = hamming_weight(2863311530)
test("hamming_weight: alternating bits", r == 16, f"got {r}")

# ── single_number ──
r = single_number([2, 2, 1])
test("single_number: three elements", r == 1, f"got {r}")

r = single_number([4, 1, 2, 1, 2])
test("single_number: classic example", r == 4, f"got {r}")

r = single_number([1])
test("single_number: single element", r == 1, f"got {r}")

r = single_number([7, -3, 7])
test("single_number: negative singleton", r == -3, f"got {r}")

r = single_number([9, 5, 5, 8, 8])
test("single_number: singleton at the start", r == 9, f"got {r}")

r = single_number([5, 5, 8, 8, 9])
test("single_number: singleton at the end", r == 9, f"got {r}")

r = single_number([3, 0, 3])
test("single_number: zero as the singleton", r == 0, f"got {r}")

# ── range_bitwise_and ──
r = range_bitwise_and(5, 7)
test("range_bitwise_and: classic example [5,7]", r == 4, f"got {r}")

r = range_bitwise_and(0, 0)
test("range_bitwise_and: zero range", r == 0, f"got {r}")

r = range_bitwise_and(6, 6)
test("range_bitwise_and: left equals right", r == 6, f"got {r}")

r = range_bitwise_and(1, 2147483647)
test("range_bitwise_and: full signed-positive range", r == 0, f"got {r}")

r = range_bitwise_and(10, 11)
test("range_bitwise_and: adjacent numbers sharing a prefix", r == 10, f"got {r}")

r = range_bitwise_and(7, 8)
test("range_bitwise_and: range crossing a power of two is zero", r == 0, f"got {r}")

r = range_bitwise_and(12, 15)
test("range_bitwise_and: power-of-two block [12,15]", r == 12, f"got {r}")

r = range_bitwise_and(1500000000, 2000000000)
test("range_bitwise_and: huge range keeps only bit 30", r == 1073741824, f"got {r}")

r = range_bitwise_and(2147483646, 2147483647)
test("range_bitwise_and: largest adjacent pair", r == 2147483646, f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
