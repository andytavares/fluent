# Run: python3 stub.py


def is_palindrome_number(x: int) -> bool:
    """Return True if the integer x reads the same forwards and backwards.
    No string conversion — digit arithmetic only."""
    # TODO: guard negatives and trailing zeros (except 0 itself), then
    # reverse the back half with rev = rev * 10 + x % 10 while x > rev
    return False


def plus_one(digits: list[int]) -> list[int]:
    """Return the digit list of the given big-endian digit list plus one."""
    # TODO: walk from the last digit; digit < 9 -> increment and return,
    # digit 9 -> set to 0 and carry on; all nines -> prepend a 1
    return []


def my_sqrt(x: int) -> int:
    """Return the integer square root of x, rounded down.
    No math.sqrt / math.pow / ** — binary-search the answer."""
    # TODO: binary search [1, x // 2] for the largest m with m * m <= x
    # (handle x < 2 first; return hi after the loop)
    return 0


def my_pow(x: float, n: int) -> float:
    """Return x raised to the integer power n in O(log |n|).
    No math.pow / ** — binary exponentiation."""
    # TODO: if n < 0, invert base once (x = 1 / x, n = -n); then square-and-
    # multiply using n % 2 and n //= 2 (only safe once n is non-negative)
    return 0.0


def main():
    print(is_palindrome_number(121))  # True
    print(plus_one([9, 9, 9]))  # [1, 0, 0, 0]
    print(my_sqrt(8))  # 2
    print(my_pow(2, 10))  # 1024


if __name__ == "__main__":
    main()
