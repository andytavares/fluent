## What you build

You write four bit-level functions: binary string addition, a set-bit count, XOR cancellation and the AND of a range. You also learn the Python-specific part: integers have no fixed width, so nothing truncates a value to 32 bits for you. This lesson builds on **Arrays & Strings**.

## Key concepts

### Python integers have no fixed width

Python integers have arbitrary precision. The operators `& | ^ ~ << >>` work on the whole value. No hidden conversion to a 32-bit word happens, as JavaScript's ToInt32 or C's `int` does.

```python
# 0: you mask off the low 32 bits
2 ** 32 & 0xFFFFFFFF
# 2147483648: no int32 sign bit
(2 ** 31) & 0xFFFFFFFF
# 2147483648: never negative
1 << 31
```

This has two results. Arithmetic never overflows. A problem defined on a 32-bit register needs a window that you build yourself with `& 0xFFFFFFFF`.

### Negative numbers have infinite leading ones

Python treats a negative integer as two's complement with infinitely many leading 1 bits. So `~x == -x - 1`, and `-1 & x == x`. `>>` copies the sign bit, and Python has no `>>>`. A loop with `n >>= 1` on negative input copies the sign bit forever and never reaches 0.

### `x & 0xFFFFFFFF` keeps a 32-bit window

The mask keeps the low 32 bits, and the result is never negative. If the problem uses signed 32-bit values, decode the sign by hand.

```python
masked = value & 0xFFFFFFFF
# bit 31 set: a negative int32
if masked & 0x80000000:
    signed = masked - (1 << 32)
else:
    signed = masked
```

For an unsigned problem, such as Number of 1 Bits, skip the decode. The masked value is the answer.

### XOR cancels pairs

`^` is associative and commutative, `x ^ x == 0` and `x ^ 0 == x`. So XOR is a running toggle log. Fold it over a list, and every value that appears an even number of times disappears. One line finds the unique element among pairs:

```python
reduce(lambda acc, x: acc ^ x, nums, 0)
```

`reduce` comes from `functools`.

### `n & (n - 1)` clears the lowest set bit

Subtracting 1 flips the lowest set bit to 0 and every bit below it to 1. The AND keeps all other bits.

```
n       = 10110100
n - 1   = 10110011
n&(n-1) = 10110000
```

Loop it to count set bits in O(number of set bits). Test `n & (n - 1) == 0` to check for a power of two. In range-AND problems, it strips the low bits fast. Its sibling `n & -n` isolates the lowest set bit.

### Binary addition works column by column

For each column, the digit sum is `a + b + carry`. Write `sum & 1` (or `sum % 2`), and carry `sum >> 1` (or `sum // 2`). This is grade-school addition, and it works on binary strings of any length. `int(s, 2)` parses a long binary string with no precision loss, but the column walk is the technique the task checks.

### Complexity of the main problems

| Problem | Time | Space | Core idea |
|---------|------|-------|-----------|
| Add Binary | O(max(m, n)) | O(max(m, n)) | per-column carry over strings |
| Number of 1 Bits | O(set bits) | O(1) | `n & (n - 1)` |
| Single Number | O(n) | O(1) | XOR cancellation |
| Bitwise AND of Numbers Range | O(log n) | O(1) | shift to the common prefix |

## Watch out

- On negative input, `n >>= 1` never ends a `while n:` loop. The sign bit refills forever.
- Mask with `0xFFFFFFFF` first when the value can be negative.
- Nothing masks for you. A value built with `<<` grows past 32 bits unless you apply `& 0xFFFFFFFF`.
- `value & 0xFFFFFFFF` is never negative. To read a signed int32, check `0x80000000` and subtract `1 << 32`.
- `x % 2` is a safe odd test in Python. `-3 % 2 == 1`, because `%` takes the sign of the divisor.
- `x & 1` also works, and it is the bit-level idiom.
- `bin()` and `int(s, 2)` are correct, but they skip the per-bit technique the task asks for.

## Problem walkthroughs

### Add Binary ★

**Problem.** Given two binary strings `a` and `b`, return their sum as a binary string. The strings hold only `'0'` and `'1'`, with no leading zeros except `"0"` itself. Inputs can be hundreds of digits long.

**Example.**

```
a = "11",   b = "1"    → "100"
a = "1010", b = "1011" → "10101"
```

**Steps.**

1. Add column by column, like decimal addition by hand. Python integers can hold the whole value, but the column walk is the technique to learn.
2. Set `i = len(a) - 1`, `j = len(b) - 1` and `carry = 0`. Start an output list of digits.
3. While `i >= 0 or j >= 0 or carry`: add `carry` and the digits `int(a[i])` and `int(b[j])` into `total`. Use 0 for an index below 0. Append `total & 1`, set `carry = total >> 1` and decrement both indexes.
4. The loop makes the least-significant digit first, so reverse and join. One reverse of a list is O(n). Prepending to a string on every iteration is O(n²).
5. The `or carry` in the loop condition handles the final overflow column with no special case. `"11" + "1"` needs a fourth digit.

**Complexity.** O(max(m, n)) time and space: one pass over the longer string.

### Reverse Bits

**Problem.** Given a 32-bit unsigned integer, return the unsigned integer whose 32 bits are in reverse order. Bit 0 swaps with bit 31, bit 1 with bit 30, and so on.

**Example.**

```
0b00000010100101000001111010011100
  (43261596)
→ 0b00111001011110000010100101000000
  (964176192)
```

**Steps.**

1. Loop exactly 32 times. Leading zeros of the input become trailing bits of the output. You can stop early at `n == 0`, but the result then still needs shifting. A fixed 32 iterations is simpler and also constant.
2. On each iteration, set `result = (result << 1) | (n & 1)`. That makes room and brings in the lowest input bit. Then set `n >>= 1`. The input is never negative, so no sign bit refills.
3. Return `result`. After exactly 32 iterations, it fits in 32 bits, and Python gives it no sign. A loop with more shifts needs `& 0xFFFFFFFF`.
4. Follow-up for many calls: reverse byte by byte with a 256-entry lookup table. Or use the O(log 32) mask-swap ladder: swap halves, then quarters, and so on.

**Complexity.** O(32) = O(1) time, O(1) space.

### Number of 1 Bits ★

**Problem.** Return the number of set bits in the 32-bit form of a non-negative integer `n`, up to 2³² − 1. This count is also the population count, or Hamming weight.

**Example.**

```
11 (0b1011)         → 3
2147483648 (bit 31) → 1
```

**Steps.**

1. The input is already in `0 <= n <= 2**32 - 1`, a valid unsigned 32-bit value. You need no mask to read it.
2. Loop while `n != 0`: set `n = n & (n - 1)` and increment a counter. Each iteration erases exactly the lowest set bit. So the loop runs once per 1-bit: at most 32 times, not always 32 times.
3. `bin(n).count("1")` is the production one-liner. Know the manual loop for the interview.
4. The alternative is 32 iterations of `count += n & 1; n >>= 1`. It is correct, but always takes 32 steps. Know both, and say why you chose one.

**Complexity.** O(set bits) time, O(1) space.

### Single Number ★

**Problem.** Every element of `nums` appears exactly twice, except one that appears once. Find it in O(n) time and O(1) space. A hash map is the obvious answer, and the problem does not allow it.

**Example.**

```
[2,2,1]     → 1
[4,1,2,1,2] → 4
```

**Steps.**

1. XOR the whole list into an accumulator that starts at 0.
2. Commutativity lets you reorder the fold so each pair sits together. `x ^ x == 0`, so pairs cancel. `acc ^ 0 == acc`, so the single value stays.
3. Return the accumulator. It works with negatives, because XOR treats the two's complement pattern as bits.

**Complexity.** O(n) time, O(1) space. This is the standard XOR-cancellation problem.

### Single Number II

**Problem.** The same setup, but every other element appears exactly three times. One element appears once. The same O(n) time and O(1) space limit applies.

**Example.**

```
[2,2,3,2]        → 3
[0,1,0,1,0,1,99] → 99
```

**Steps.**

1. XOR alone cannot help, because triples do not cancel. Instead, count for each of the 32 bit positions how many elements have that bit set. A value that appears 3 times adds a multiple of 3 to each position. The single value's bits are the positions where `count % 3 == 1`.
2. For bit `i` in `range(32)`, sum `(x >> i) & 1` over the list. If the total mod 3 is 1, set bit `i` in the result with `result |= 1 << i`.
3. If bit 31 is set, the answer is negative, but `result` holds the unsigned pattern. Decode it: if `result & 0x80000000`, return `result - (1 << 32)`.
4. A two-variable automaton tracks the count mod 3 in O(1) per element, with no inner loop: `ones = (ones ^ x) & ~twos; twos = (twos ^ x) & ~ones`. Know it by name, but derive the counting version first.

**Complexity.** O(32n) = O(n) time, O(1) space.

### Bitwise AND of Numbers Range ★

**Problem.** Given `left <= right`, both in `[0, 2³¹ − 1]`, return the AND of every integer in `[left, right]`. That is `left & (left+1) & … & right`, but the range can hold two billion values.

**Example.**

```
left = 5, right = 7 → 4
  (0b101 & 0b110 & 0b111 = 0b100)
left = 0, right = 2**31 - 1 → 0
```

**Steps.**

1. The AND of a range is the common binary prefix of `left` and `right`, with zeros below it. Below the highest differing bit, each position is 0 somewhere in the range. For example, crossing from `…0111` to `…1000` zeroes each low position. So all lower bits AND to 0.
2. Shift both endpoints right together, and count the steps, until `left == right`. What remains is the common prefix.
3. Return `left << shift` to move the prefix back to its position. The result is ≤ `right` ≤ 2³¹ − 1.
4. Know the Kernighan variant: `while left < right: right &= right - 1`, then return `right`. Clearing the lowest set bit of `right` again and again also reaches the common prefix.

**Complexity.** O(log n), at most 31 iterations, and O(1) space. Never enumerate the range.

## Interview follow-ups

- After Single Number: "Two elements appear once, the rest twice." XOR all to get `a ^ b`. Split the list by any set bit of that XOR, `xor & -xor`, and reduce each side separately.
- After Single Number II: "Every element appears k times except one." Per-bit counting mod k works for any k. The two-variable trick works only for k = 3.
- After Number of 1 Bits: "Give the popcount for every number 0..n." Use dynamic programming: `count[i] = count[i >> 1] + (i & 1)`, O(n) in total.
- After Bitwise AND of Numbers Range: "Give the OR of a range." Use the common prefix again, but the differing suffix becomes all ones: prefix + `(1 << shift) - 1`.
- Python: "Why does Single Number II need a sign decode, but Reverse Bits does not?" Reverse Bits returns an unsigned value. Single Number II returns a signed value that can be negative.

## The task

Write four bit functions. Do not use hash maps, sorting or `int(s, 2)` on the binary strings. Each function has a bit-level technique and a complexity limit.

### `add_binary(a, b)`

`a` and `b` are binary strings. They hold only `'0'` and `'1'`, with no leading zeros except `"0"` itself.

1. Return their sum as a binary string in the same format.
2. Inputs can be hundreds of digits long.
3. Do not convert with `int(a, 2) + int(b, 2)`. Add the strings column by column with a carry.
4. Run in O(max(m, n)) time.

```python
add_binary("11", "1")  # "100"
add_binary("1010", "1011")  # "10101"
add_binary("0", "0")  # "0"
# "1" + "0" * 100
add_binary("1" * 100, "1")
```

Edge cases:

- `"0" + "0"`: return `"0"`, not `"00"`.
- Very different lengths.
- A final carry that adds an extra digit.
- Inputs of 100 or more digits.

### `hamming_weight(n)`

`0 <= n <= 2**32 - 1`.

1. Return the number of set bits in the 32-bit form of `n`.
2. Values with bit 31 set, 2147483648 and up, are in range. Python never reads them as negative.
3. Clear the lowest set bit with `n & (n - 1)` until `n` is 0. Or test `n & 1` and shift with `>>`.

```python
# 3: 0b1011
hamming_weight(11)
# 1: 0b10000000
hamming_weight(128)
hamming_weight(0)  # 0
# 31: all bits except bit 1
hamming_weight(4294967293)
# 1: only bit 31
hamming_weight(2147483648)
```

Edge cases:

- 0.
- Exactly one bit set, including bit 31 alone.
- All 32 bits set: 4294967295 gives 32.

### `single_number(nums)`

Every element of `nums` appears exactly twice, except one element that appears exactly once.

1. Return that element.
2. Run in O(n) time and O(1) extra space. Do not use a dict, a set or a `Counter` tally.
3. XOR the list: pairs cancel, and the single value stays.

```python
single_number([2, 2, 1])  # 1
single_number([4, 1, 2, 1, 2])  # 4
single_number([1])  # 1
single_number([7, -3, 7])  # -3
```

Edge cases:

- A single-element list.
- Negative values.
- The single value at the start, in the middle or at the end.

### `range_bitwise_and(left, right)`

`0 <= left <= right <= 2**31 - 1`.

1. Return the bitwise AND of all integers in the inclusive range `[left, right]`.
2. The range can hold billions of numbers, so do not loop over it.
3. The answer is the common binary prefix of `left` and `right`, with zeros below it.
4. Shift both right until they are equal, then shift back.

```python
range_bitwise_and(5, 7)  # 4
range_bitwise_and(0, 0)  # 0
# 6: left == right gives the number
range_bitwise_and(6, 6)
range_bitwise_and(1, 2147483647)  # 0
# 1073741824: only bit 30 is shared
range_bitwise_and(1500000000, 2000000000)
```

Edge cases:

- `left == right`: return the number itself.
- `left = 0`: always 0.
- A range that crosses a power of two: 0.
- The full range `[1, 2**31 - 1]`.
- Large endpoints that are close together.
