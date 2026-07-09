# Run: python3 stub.py


def add_binary(a: str, b: str) -> str:
    """Return the sum of two binary strings as a binary string.
    Inputs may be hundreds of digits — add column by column with a carry."""
    # TODO: walk both strings from the back with a carry;
    # digit = total & 1, carry = total >> 1; loop while i >= 0 or j >= 0 or carry;
    # collect digits in a list and reverse-join at the end
    return ""


def hamming_weight(n: int) -> int:
    """Return the number of set bits in the 32-bit representation of n."""
    # TODO: clear the lowest set bit with n = n & (n - 1) until n is 0,
    # counting iterations
    return 0


def single_number(nums: list[int]) -> int:
    """Return the element that appears exactly once (all others appear
    twice). O(n) time, O(1) space — no dict/set."""
    # TODO: XOR-fold the list — pairs cancel (x ^ x == 0), the singleton survives
    return 0


def range_bitwise_and(left: int, right: int) -> int:
    """Return the bitwise AND of every integer in [left, right]."""
    # TODO: the answer is the common binary prefix — shift both right
    # until left == right, counting shifts, then shift back left
    return 0


def main():
    print(add_binary("1010", "1011"))  # 10101
    print(hamming_weight(11))  # 3
    print(hamming_weight(2147483648))  # 1
    print(single_number([4, 1, 2, 1, 2]))  # 4
    print(range_bitwise_and(5, 7))  # 4


if __name__ == "__main__":
    main()
