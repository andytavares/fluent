# Run: python3 exemplar.py
from functools import reduce


def add_binary(a: str, b: str) -> str:
    """Adds two binary strings column by column with a carry — grade-school
    addition on characters, so 200-digit inputs are no problem.
    O(max(m, n)) time and space.
    """
    digits: list[int] = []
    carry = 0
    i, j = len(a) - 1, len(b) - 1
    while i >= 0 or j >= 0 or carry:
        total = carry
        if i >= 0:
            total += int(a[i])
            i -= 1
        if j >= 0:
            total += int(b[j])
            j -= 1
        digits.append(total & 1)
        carry = total >> 1
    return "".join(str(d) for d in reversed(digits))


def hamming_weight(n: int) -> int:
    """Population count via n & (n - 1), which clears exactly the lowest
    set bit per iteration — O(set bits), not O(32).
    n is guaranteed to already be a valid unsigned 32-bit value.
    """
    count = 0
    while n != 0:
        n &= n - 1
        count += 1
    return count


def single_number(nums: list[int]) -> int:
    """XOR-fold: x ^ x == 0 and x ^ 0 == x, so every pair annihilates and
    only the singleton survives. Negatives work unchanged — Python's ^
    operates correctly on its two's-complement view of negative ints.
    O(n) time, O(1) space.
    """
    return reduce(lambda acc, x: acc ^ x, nums, 0)


def range_bitwise_and(left: int, right: int) -> int:
    """AND of [left, right] is the common binary prefix of the endpoints:
    below the highest differing bit, every pattern occurs somewhere in the
    range, so those bits all AND to zero. Shift to the prefix, shift back.
    O(log n) time, O(1) space.
    """
    shift = 0
    while left < right:
        left >>= 1
        right >>= 1
        shift += 1
    return left << shift


def main():
    print(add_binary("1010", "1011"))  # 10101
    print(hamming_weight(11))  # 3
    print(hamming_weight(2147483648))  # 1
    print(single_number([4, 1, 2, 1, 2]))  # 4
    print(range_bitwise_and(5, 7))  # 4


if __name__ == "__main__":
    main()
