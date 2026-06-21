import sys
from stub import climbing_stairs, rob, coin_change

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


# climbing_stairs tests
result = climbing_stairs(1)
test("stairs: n=1", result == 1, f"got {result}")

result = climbing_stairs(2)
test("stairs: n=2", result == 2, f"got {result}")

result = climbing_stairs(3)
test("stairs: n=3", result == 3, f"got {result}")

result = climbing_stairs(4)
test("stairs: n=4", result == 5, f"got {result}")

result = climbing_stairs(5)
test("stairs: n=5", result == 8, f"got {result}")

result = climbing_stairs(10)
test("stairs: n=10", result == 89, f"got {result}")

# rob tests
result = rob([1, 2, 3, 1])
test("rob: [1,2,3,1]", result == 4, f"got {result}, want 4")

result = rob([2, 7, 9, 3, 1])
test("rob: [2,7,9,3,1]", result == 12, f"got {result}, want 12")

result = rob([1])
test("rob: single house", result == 1, f"got {result}, want 1")

result = rob([1, 2])
test("rob: two houses", result == 2, f"got {result}, want 2")

result = rob([5, 1, 1, 5])
test("rob: [5,1,1,5]", result == 10, f"got {result}, want 10")

result = rob([2, 1, 1, 2])
test("rob: [2,1,1,2]", result == 4, f"got {result}, want 4")

# coin_change tests
result = coin_change([1, 2, 5], 11)
test("coins: [1,2,5] amount=11", result == 3, f"got {result}, want 3")

result = coin_change([2], 3)
test("coins: [2] amount=3 impossible", result == -1, f"got {result}, want -1")

result = coin_change([1], 0)
test("coins: amount=0", result == 0, f"got {result}, want 0")

result = coin_change([1], 1)
test("coins: [1] amount=1", result == 1, f"got {result}, want 1")

result = coin_change([1, 5, 11], 15)
test("coins: [1,5,11] amount=15", result == 3, f"got {result}, want 3")

result = coin_change([2, 5, 10, 1], 27)
test("coins: multiple denoms amount=27", result == 4, f"got {result}, want 4")

result = coin_change([186, 419, 83, 408], 6249)
test("coins: large amount", result == 20, f"got {result}, want 20")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
