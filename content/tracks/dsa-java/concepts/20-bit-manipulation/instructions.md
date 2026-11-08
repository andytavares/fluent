## What you build

You write four bit-level functions: binary string addition, a set-bit count, XOR cancellation and the AND of a range. You also learn the Java-specific part: `int` is always a 32-bit signed two's complement integer, and Java has no unsigned `int`. This lesson builds on **Arrays & Strings**.

## Key concepts

### `int` is always exactly 32 bits

A Java `int` is a 32-bit signed two's complement integer. The operators `& | ^ ~ << >> >>>` work on that value directly, with no conversion step. Results are `int` values too.

```java
// -2147483648: bit 31 is the sign bit
int a = 1 << 31;
// -1: 32 ones is -1 in two's complement
int b = 0xFFFFFFFF;
// 0: bit 32 falls off the edge
int c = (int) (1L << 32);
// Compile error: too large for int
int d = 2147483648;
```

This has two results. Values from 2³¹ to 2³² − 1 have no positive `int` form, so you write them as hex literals such as `0x80000000`. A value with bit 31 set prints as negative, even when you think of it as unsigned.

### `>>` copies the sign bit, `>>>` fills with zeros

| Operator | Name | Fills empty bits with | `-8 op 1` |
|----------|------|-------------------------|-----------|
| `>>` | arithmetic shift | copies of the sign bit | `-4` |
| `>>>` | logical shift | zeros | `2147483644` |

`>>` keeps the numeric meaning of signed values. `>>>` keeps the bit pattern. When you treat a number as a bag of 32 bits, use `>>>`. A loop with `n >>= 1` on negative input copies the sign bit forever and never reaches 0.

### `Integer.toUnsignedLong(x)` reads a bit pattern as unsigned

Java has no unsigned `int`, so a pattern with bit 31 set is a negative `int`. `Integer.toUnsignedLong(x)` returns the unsigned reading of the same bits as a `long`: `Integer.toUnsignedLong(-1) == 4294967295L`. Use it, or `Integer.toUnsignedString(x)`, to print a "negative" result that you built with `<<`.

### XOR cancels pairs

`^` is associative and commutative, `x ^ x == 0` and `x ^ 0 == x`. So XOR is a running toggle log. Fold it over a list, and every value that appears an even number of times disappears. One loop finds the unique element among pairs:

```java
int result = 0;
for (int x : nums) result ^= x;
```

### `n & (n - 1)` clears the lowest set bit

Subtracting 1 flips the lowest set bit to 0 and every bit below it to 1. The AND keeps all other bits.

```
n       = 10110100
n - 1   = 10110011
n&(n-1) = 10110000
```

Loop it to count set bits in O(number of set bits). Test `(n & (n - 1)) == 0` to check for a power of two. In range-AND problems, it strips the low bits fast. Its sibling `n & -n` isolates the lowest set bit.

### Binary addition works column by column

For each column, the digit sum is `a + b + carry`. Write `sum & 1` (or `sum % 2`), and carry `sum >> 1` (or `sum / 2`). This is grade-school addition, and it works on binary strings of any length. A 200-character binary string overflows every Java number type except `BigInteger`. When the input is a string, do string arithmetic with a `StringBuilder`.

### Complexity of the main problems

| Problem | Time | Space | Core idea |
|---------|------|-------|-----------|
| Add Binary | O(max(m, n)) | O(max(m, n)) | per-column carry over strings |
| Number of 1 Bits | O(set bits) | O(1) | `n & (n - 1)` |
| Single Number | O(n) | O(1) | XOR cancellation |
| Bitwise AND of Numbers Range | O(log n) | O(1) | shift to the common prefix |

## Watch out

- On negative input, `n >>= 1` never ends a `while (n != 0)` loop. The sign bit refills forever.
- Use `n >>>= 1` instead. Or clear bits with `n & (n - 1)`, which removes one set bit each time, even for negatives.
- `(result << 1) | bit` builds the correct bit pattern. If bit 31 is set, the number is negative.
- That is the same bit pattern. Print it with `Integer.toUnsignedString` to see the unsigned value.
- Java takes `int` shift counts mod 32. `x << 32 == x`, not 0.
- 32 shifts of one place each work. One shift of 32 places changes nothing.
- Do not use `Integer.parseInt(s, 2)` or `Long.parseLong(s, 2)` on long binary strings. `long` holds only 64 bits.
- Past 64 bits, `Long.parseLong` throws `NumberFormatException`. Use string arithmetic, or `BigInteger` if allowed.
- Values from 2³¹ to 2³² − 1 cannot be decimal `int` literals. `int x = 2147483648;` does not compile.
- Write them as hex literals, such as `0x80000000`. The bit pattern is a negative `int`.
- `1 << 31` is negative. For the unsigned 2147483648, write `1L << 31`, a `long`.
- For an odd test on a number that can be negative, use `x & 1`, not `x % 2`.
- `-3 % 2 == -1` in Java. It fails an `== 1` comparison.

## Problem walkthroughs

### Add Binary ★

**Problem.** Given two binary strings `a` and `b`, return their sum as a binary string. The strings hold only `'0'` and `'1'`, with no leading zeros except `"0"` itself. Inputs can be hundreds of digits long.

**Example.**

```
a = "11",   b = "1"    → "100"
a = "1010", b = "1011" → "10101"
```

**Steps.**

1. A numeric conversion fails, because the strings can be longer than 64 bits. Add column by column, like decimal addition by hand.
2. Set `i = a.length() - 1`, `j = b.length() - 1` and `carry = 0`. Start a `StringBuilder` for the output digits.
3. While `i >= 0 || j >= 0 || carry != 0`: set `sum = carry` plus `a.charAt(i) - '0'` and `b.charAt(j) - '0'` where the index is valid. Append `sum & 1`, set `carry = sum >> 1` and decrement both indexes.
4. The loop makes the least-significant digit first, so call `reverse()` on the builder. One reverse is O(n). Prepending to a `String` on every iteration is O(n²).
5. The `|| carry != 0` in the loop condition handles the final overflow column with no special case. `"11" + "1"` needs a fourth digit.

**Complexity.** O(max(m, n)) time and space: one pass over the longer string.

### Reverse Bits

**Problem.** Given a 32-bit integer, return the `int` whose 32 bits are in reverse order. Bit 0 swaps with bit 31, bit 1 with bit 30, and so on.

**Example.**

```
0b00000010100101000001111010011100
  (43261596)
→ 0b00111001011110000010100101000000
  (964176192)
```

**Steps.**

1. Loop exactly 32 times. Leading zeros of the input become trailing bits of the output. You can stop early at `n == 0`, but the result then still needs shifting. A fixed 32 iterations is simpler and also constant.
2. On each iteration, set `result = (result << 1) | (n & 1)`. That makes room and brings in the lowest input bit. Then set `n >>>= 1`. A `>>` would drag sign bits into the bit bag.
3. Return `result`. If input bit 0 was 1, output bit 31 is set, and the `int` prints as negative. It is the same bit pattern that the problem calls unsigned.
4. Follow-up for many calls: reverse byte by byte with a 256-entry lookup table. Or use the O(log 32) mask-swap ladder: swap halves, then quarters, and so on.

**Complexity.** O(32) = O(1) time, O(1) space.

### Number of 1 Bits ★

**Problem.** Return the number of set bits in the 32-bit `int` `n`. Values with bit 31 set arrive as negative numbers. This count is also the population count, or Hamming weight.

**Example.**

```
11 (0b1011)         → 3
0x80000000 (bit 31) → 1
```

**Steps.**

1. You need no normalization. `n` is already a 32-bit `int`, positive or negative.
2. Loop while `n != 0`: set `n = n & (n - 1)` and increment a counter. Each iteration erases exactly the lowest set bit. So the loop runs once per 1-bit: at most 32 times, not always 32 times.
3. The trick works the same for negative `n`, because it changes bits, not the sign.
4. The alternative is 32 iterations of `count += n & 1; n >>>= 1`. It is correct, but always takes 32 steps. Know both, and say why you chose one. `Integer.bitCount(n)` is the library call.

**Complexity.** O(set bits) time, O(1) space.

### Single Number ★

**Problem.** Every element of `nums` appears exactly twice, except one that appears once. Find it in O(n) time and O(1) space. A hash map is the obvious answer, and the problem does not allow it.

**Example.**

```
[2,2,1]     → 1
[4,1,2,1,2] → 4
```

**Steps.**

1. XOR the whole array into an accumulator that starts at 0.
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
2. For bit `i` in 0..31, sum `(x >>> i) & 1` over the array. If the total mod 3 is 1, set bit `i` in the result.
3. If bit 31 is set, the answer is negative. Build the result with `result |= 1 << i`, and signed `int` semantics give the right value.
4. A two-variable automaton tracks the count mod 3 in O(1) per element, with no inner loop: `ones = (ones ^ x) & ~twos; twos = (twos ^ x) & ~ones`. Know it by name, but derive the counting version first.

**Complexity.** O(32n) = O(n) time, O(1) space.

### Bitwise AND of Numbers Range ★

**Problem.** Given `left <= right`, both in `[0, 2³¹ − 1]`, return the AND of every integer in `[left, right]`. That is `left & (left+1) & … & right`, but the range can hold two billion values.

**Example.**

```
left = 5, right = 7 → 4
  (0b101 & 0b110 & 0b111 = 0b100)
left = 0, right = 2^31 - 1 → 0
```

**Steps.**

1. The AND of a range is the common binary prefix of `left` and `right`, with zeros below it. Below the highest differing bit, each position is 0 somewhere in the range. For example, crossing from `…0111` to `…1000` zeroes each low position. So all lower bits AND to 0.
2. Shift both endpoints right together, and count the steps, until `left == right`. What remains is the common prefix.
3. Return `left << shift` to move the prefix back to its position. The result cannot overflow into the sign bit, because it is ≤ `right` ≤ 2³¹ − 1.
4. Know the Kernighan variant: `while (left < right) right &= right - 1; return right`. Clearing the lowest set bit of `right` again and again also reaches the common prefix.

**Complexity.** O(log n), at most 31 iterations, and O(1) space. Never enumerate the range.

## Interview follow-ups

- After Single Number: "Two elements appear once, the rest twice." XOR all to get `a ^ b`. Split the array by any set bit of that XOR, `xor & -xor`, and reduce each side separately.
- After Single Number II: "Every element appears k times except one." Per-bit counting mod k works for any k. The two-variable trick works only for k = 3.
- After Number of 1 Bits: "Give the popcount for every number 0..n." Use dynamic programming: `count[i] = count[i >> 1] + (i & 1)`, O(n) in total.
- After Bitwise AND of Numbers Range: "Give the OR of a range." Use the common prefix again, but the differing suffix becomes all ones: prefix + `(1 << shift) - 1`.
- Java: "Why does your bit reversal return a negative number? How do you fix it?" `int` is signed, and bit 31 is the sign bit. `Integer.toUnsignedLong` reads the same bits as unsigned.

## The task

Write four bit functions as static methods of `Solution`. Do not use hash maps, sorting or numeric conversion of long binary strings. Each function has a bit-level technique and a complexity limit.

### `addBinary(String a, String b)`

`a` and `b` are binary strings. They hold only `'0'` and `'1'`, with no leading zeros except `"0"` itself.

1. Return their sum as a binary string in the same format.
2. Inputs can be hundreds of digits long, past the 64 bits of `long`.
3. `Integer.parseInt` or `Long.parseLong` conversion fails. Add the strings column by column with a carry.
4. Run in O(max(m, n)) time.

```java
addBinary("11", "1"); // "100"
addBinary("1010", "1011"); // "10101"
addBinary("0", "0"); // "0"
// "1" + "0".repeat(100)
addBinary("1".repeat(100), "1");
```

Edge cases:

- `"0" + "0"`: return `"0"`, not `"00"`.
- Very different lengths.
- A final carry that adds an extra digit.
- Inputs of 100 or more digits.

### `hammingWeight(int n)`

`n` is any 32-bit `int`.

1. Return the number of set bits in the 32-bit form of `n`.
2. Values with bit 31 set are the trap. They arrive as negative `int` values, written as hex literals such as `0x80000000`.
3. A loop based on `>>` never ends on them.
4. Clear bits with `n & (n - 1)`, which works for negative `n` too. Or shift with `>>>`.

```java
// 3: 0b1011
hammingWeight(11);
// 1: 0b10000000
hammingWeight(128);
hammingWeight(0); // 0
// 31: all bits except bit 1
hammingWeight(0xFFFFFFFD);
// 1: only bit 31
hammingWeight(0x80000000);
```

Edge cases:

- 0.
- Exactly one bit set, including bit 31 alone.
- All 32 bits set: `0xFFFFFFFF` gives 32.

### `singleNumber(int[] nums)`

Every element of `nums` appears exactly twice, except one element that appears exactly once.

1. Return that element.
2. Run in O(n) time and O(1) extra space. Do not use a `HashMap` or a `HashSet` tally.
3. XOR the array: pairs cancel, and the single value stays.

```java
singleNumber(new int[]{2, 2, 1}); // 1
// 4
singleNumber(new int[]{4, 1, 2, 1, 2});
singleNumber(new int[]{1}); // 1
// -3
singleNumber(new int[]{7, -3, 7});
```

Edge cases:

- A single-element array.
- Negative values.
- The single value at the start, in the middle or at the end.

### `rangeBitwiseAnd(int left, int right)`

`0 <= left <= right <= 2^31 - 1`.

1. Return the bitwise AND of all integers in the inclusive range `[left, right]`.
2. The range can hold billions of numbers, so do not loop over it.
3. The answer is the common binary prefix of `left` and `right`, with zeros below it.
4. Shift both right until they are equal, then shift back.

```java
rangeBitwiseAnd(5, 7); // 4
rangeBitwiseAnd(0, 0); // 0
// 6: left == right gives the number
rangeBitwiseAnd(6, 6);
rangeBitwiseAnd(1, 2147483647); // 0
// 1073741824: only bit 30 is shared
rangeBitwiseAnd(1500000000, 2000000000);
```

Edge cases:

- `left == right`: return the number itself.
- `left = 0`: always 0.
- A range that crosses a power of two: 0.
- The full range `[1, 2^31 - 1]`.
- Large endpoints that are close together.
