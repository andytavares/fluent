# Run: python3 exemplar.py


def is_palindrome_number(x: int) -> bool:
    """Half reversal: reverse digits from the back until the reversed part
    catches up with what's left. Guards keep the loop's division
    non-negative (// floors toward -inf on negatives).
    O(log10 x) time, O(1) space.
    """
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    rev = 0
    while x > rev:
        rev = rev * 10 + x % 10
        x //= 10
    return x == rev or x == rev // 10


def plus_one(digits: list[int]) -> list[int]:
    """Increment a big-endian digit list the way you'd do it on paper:
    from the last digit, carrying nines. An early return means most calls
    touch exactly one digit.
    O(n) worst case / O(1) extra space beyond the result.
    """
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return [1] + digits


def my_sqrt(x: int) -> int:
    """Binary search over the answer space: m * m <= x is monotone in m.
    x and every candidate stay non-negative, so // matches truncation.
    O(log x) time, O(1) space.
    """
    if x < 2:
        return x
    lo, hi = 1, x // 2
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        sq = mid * mid
        if sq == x:
            return mid
        if sq < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return hi


def my_pow(x: float, n: int) -> float:
    """Binary exponentiation: square the base once per bit of n, folding
    it into the result on set bits. The sign of n is flipped once up
    front so every later n //= 2 behaves like truncating division instead
    of floor-toward-negative-infinity.
    O(log |n|) time, O(1) space.
    """
    if n < 0:
        x = 1 / x
        n = -n
    result = 1.0
    while n > 0:
        if n % 2 == 1:
            result *= x
        x *= x
        n //= 2
    return result


def main():
    print(is_palindrome_number(121))  # True
    print(plus_one([9, 9, 9]))  # [1, 0, 0, 0]
    print(my_sqrt(8))  # 2
    print(my_pow(2, 10))  # 1024


if __name__ == "__main__":
    main()
