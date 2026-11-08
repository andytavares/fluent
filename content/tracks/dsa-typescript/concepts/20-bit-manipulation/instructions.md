## What you build

You write four bit-level functions: binary string addition, a set-bit count, XOR cancellation and the AND of a range. You also learn the TypeScript-specific part: every bitwise operator converts its operands to a 32-bit signed integer. This lesson builds on **Arrays & Strings**.

## Key concepts

### Bitwise operators work on a 32-bit window

TypeScript `number` values are 64-bit floats. The operators `& | ^ ~ << >>` all run ToInt32 first. ToInt32 keeps only the low 32 bits and reads them as a signed two's complement integer. Results come back the same way.

```ts
// 0: bit 32 falls off the edge
2 ** 32 | 0
// -2147483648: bit 31 is the sign bit
(2 ** 31) | 0
// -2147483648: same value, by shifting
1 << 31
// -1: 32 ones is -1 in two's complement
4294967295 | 0
```

This has two results. Bitwise code is correct only for values that fit in 32 bits. A value with bit 31 set prints as negative, even when you think of it as unsigned.

### `>>` copies the sign bit, `>>>` fills with zeros

| Operator | Name | Fills empty bits with | `-8 op 1` |
|----------|------|-------------------------|-----------|
| `>>` | arithmetic shift | copies of the sign bit | `-4` |
| `>>>` | logical shift | zeros | `2147483644` |

`>>` keeps the numeric meaning of signed values. `>>>` keeps the bit pattern. When you treat a number as a bag of 32 bits, use `>>>`. A loop with `n >>= 1` on negative input copies the sign bit forever and never reaches 0.

### `x >>> 0` reads a bit pattern as unsigned

`x >>> 0` shifts by zero, so the bits stay the same. The result is the unsigned reading of those bits: `(-1) >>> 0 === 4294967295`. Use it to fix a "negative" result after you build bits with `<<`.

### XOR cancels pairs

`^` is associative and commutative, `x ^ x === 0` and `x ^ 0 === x`. So XOR is a running toggle log. Fold it over a list, and every value that appears an even number of times disappears. One line finds the unique element among pairs:

```ts
nums.reduce((acc, x) => acc ^ x, 0)
```

### `n & (n - 1)` clears the lowest set bit

Subtracting 1 flips the lowest set bit to 0 and every bit below it to 1. The AND keeps all other bits.

```
n       = 10110100
n - 1   = 10110011
n&(n-1) = 10110000
```

Loop it to count set bits in O(number of set bits). Test `(n & (n - 1)) === 0` to check for a power of two. In range-AND problems, it strips the low bits fast. Its sibling `n & -n` isolates the lowest set bit.

### Binary addition works column by column

For each column, the digit sum is `a + b + carry`. Write `sum & 1` (or `sum % 2`), and carry `sum >> 1` (or `floor(sum / 2)`). This is grade-school addition, and it works on binary strings of any length. A 200-character binary string overflows every TypeScript number type except `bigint`. When the input is a string, do string arithmetic.

### Complexity of the main problems

| Problem | Time | Space | Core idea |
|---------|------|-------|-----------|
| Add Binary | O(max(m, n)) | O(max(m, n)) | per-column carry over strings |
| Number of 1 Bits | O(set bits) | O(1) | `n & (n - 1)` |
| Single Number | O(n) | O(1) | XOR cancellation |
| Bitwise AND of Numbers Range | O(log n) | O(1) | shift to the common prefix |

## Watch out

- On negative input, `n >>= 1` never ends a `while (n !== 0)` loop. The sign bit refills forever.
- Use `n >>>= 1` instead. Or clear bits with `n & (n - 1)`, which removes one set bit each time, even for negatives.
- `(result << 1) | bit` builds the correct bit pattern. If bit 31 is set, the number is negative.
- End functions that return unsigned values with `>>> 0`.
- TypeScript takes shift counts mod 32. `x << 32 === x`, not 0.
- 32 shifts of one place each work. One shift of 32 places changes nothing.
- Do not use `parseInt(s, 2)` on long binary strings. Doubles hold only 53 bits of integer precision.
- Past 53 bits, `parseInt` rounds digits away with no error. Use string arithmetic, or `bigint` if allowed.
- `&`, `|` and `^` truncate values above 2³² − 1 first. `2 ** 32 | 1 === 1`.
- Bitwise tricks do not work on values near `Number.MAX_SAFE_INTEGER`.
- `1 << 31` is negative. For the unsigned 2147483648, write `2 ** 31` or `(1 << 31) >>> 0`.
- For an odd test on a number that can be negative, use `x & 1`, not `x % 2`.
- `-3 % 2 === -1`. It is truthy, but it fails an `=== 1` comparison.

## Problem walkthroughs

### Add Binary ★

**Problem.** Given two binary strings `a` and `b`, return their sum as a binary string. The strings hold only `'0'` and `'1'`, with no leading zeros except `"0"` itself. Inputs can be hundreds of digits long.

**Example.**

```
a = "11",   b = "1"    → "100"
a = "1010", b = "1011" → "10101"
```

**Steps.**

1. A numeric conversion fails, because the strings can be longer than 53 bits. Add column by column, like decimal addition by hand.
2. Set `i = a.length - 1`, `j = b.length - 1` and `carry = 0`. Start an output array of digits.
3. While `i >= 0 || j >= 0 || carry`: set `sum = carry + (a[i] or 0) + (b[j] or 0)`. Append `sum & 1`, set `carry = sum >> 1` and decrement both indexes.
4. The loop makes the least-significant digit first, so reverse and join. One reverse of an array is O(n). Prepending to a string on every iteration is O(n²).
5. The `|| carry` in the loop condition handles the final overflow column with no special case. `"11" + "1"` needs a fourth digit.

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

1. Loop exactly 32 times. Leading zeros of the input become trailing bits of the output. You can stop early at `n === 0`, but the result then still needs shifting. A fixed 32 iterations is simpler and also constant.
2. On each iteration, set `result = (result << 1) | (n & 1)`. That makes room and brings in the lowest input bit. Then set `n >>>= 1`. A `>>` would drag sign bits into the bit bag.
3. Return `result >>> 0`. If input bit 0 was 1, output bit 31 is set, and the signed result is negative. `>>> 0` reads the same bits as unsigned.
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

1. Normalize once: `n = n >>> 0`. Inputs of 2³¹ and above do not fit in the signed range. This fixes the reading without changing any bits.
2. Loop while `n !== 0`: set `n = (n & (n - 1)) >>> 0` and increment a counter. Each iteration erases exactly the lowest set bit. So the loop runs once per 1-bit: at most 32 times, not always 32 times.
3. The `>>> 0` inside the loop keeps the value unsigned. So the `!== 0` test is about bits, not the sign.
4. The alternative is 32 iterations of `count += n & 1; n >>>= 1`. It is correct, but always takes 32 steps. Know both, and say why you chose one.

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
2. Commutativity lets you reorder the fold so each pair sits together. `x ^ x === 0`, so pairs cancel. `acc ^ 0 === acc`, so the single value stays.
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

1. XOR alone cannot help, because triples do not cancel. Instead, count for each of the 32 bit positions how many elements have that bit set. A value that appears 3 times adds a multiple of 3 to each position. The single value's bits are the positions where `count % 3 === 1`.
2. For bit `i` in 0..31, sum `(x >>> i) & 1` over the array. If the total mod 3 is 1, set bit `i` in the result.
3. If bit 31 is set, the answer is negative. Build the result with `result |= 1 << i`, and signed semantics give the right value. Or convert at the end with `| 0`.
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
2. Shift both endpoints right together, and count the steps, until `left === right`. What remains is the common prefix.
3. Return `left << shift` to move the prefix back to its position. The result cannot overflow into the sign bit, because it is ≤ `right` ≤ 2³¹ − 1.
4. Know the Kernighan variant: `while (left < right) right &= right - 1; return right`. Clearing the lowest set bit of `right` again and again also reaches the common prefix.

**Complexity.** O(log n), at most 31 iterations, and O(1) space. Never enumerate the range.

## Interview follow-ups

- After Single Number: "Two elements appear once, the rest twice." XOR all to get `a ^ b`. Split the array by any set bit of that XOR, `xor & -xor`, and reduce each side separately.
- After Single Number II: "Every element appears k times except one." Per-bit counting mod k works for any k. The two-variable trick works only for k = 3.
- After Number of 1 Bits: "Give the popcount for every number 0..n." Use dynamic programming: `count[i] = count[i >> 1] + (i & 1)`, O(n) in total.
- After Bitwise AND of Numbers Range: "Give the OR of a range." Use the common prefix again, but the differing suffix becomes all ones: prefix + `(1 << shift) - 1`.
- TypeScript: "Why does your bit reversal return a negative number? How do you fix it?" `<<` builds a signed int32. `>>> 0` reads the same bits as unsigned.

## The task

Write four bit functions. Do not use hash maps, sorting or numeric conversion of long binary strings. Each function has a bit-level technique and a complexity limit.

### `addBinary(a: string, b: string): string`

`a` and `b` are binary strings. They hold only `'0'` and `'1'`, with no leading zeros except `"0"` itself.

1. Return their sum as a binary string in the same format.
2. Inputs can be hundreds of digits long, past the 53-bit integer precision of `Number`.
3. `parseInt` or `Number` conversion gives wrong answers. Add the strings column by column with a carry.
4. Run in O(max(m, n)) time.

```ts
addBinary("11", "1") // "100"
addBinary("1010", "1011") // "10101"
addBinary("0", "0") // "0"
// "1" + "0".repeat(100)
addBinary("1".repeat(100), "1")
```

Edge cases:

- `"0" + "0"`: return `"0"`, not `"00"`.
- Very different lengths.
- A final carry that adds an extra digit.
- Inputs of 100 or more digits.

### `hammingWeight(n: number): number`

`0 <= n <= 2**32 - 1`.

1. Return the number of set bits in the 32-bit form of `n`.
2. Values with bit 31 set, 2147483648 and up, are the trap. As int32 values, they are negative.
3. A loop based on `>>` never ends on them.
4. Normalize with `n >>> 0`. Then clear bits with `n & (n - 1)` and normalize again with `>>> 0`. Or shift with `>>>`.

```ts
// 3: 0b1011
hammingWeight(11)
// 1: 0b10000000
hammingWeight(128)
hammingWeight(0) // 0
// 31: all bits except bit 1
hammingWeight(4294967293)
// 1: only bit 31
hammingWeight(2147483648)
```

Edge cases:

- 0.
- Exactly one bit set, including bit 31 alone.
- All 32 bits set: 4294967295 gives 32.

### `singleNumber(nums: number[]): number`

Every element of `nums` appears exactly twice, except one element that appears exactly once.

1. Return that element.
2. Run in O(n) time and O(1) extra space. Do not use a Map, a Set or an object tally.
3. XOR the array: pairs cancel, and the single value stays.

```ts
singleNumber([2, 2, 1]) // 1
singleNumber([4, 1, 2, 1, 2]) // 4
singleNumber([1]) // 1
singleNumber([7, -3, 7]) // -3
```

Edge cases:

- A single-element array.
- Negative values.
- The single value at the start, in the middle or at the end.

### `rangeBitwiseAnd(left: number, right: number): number`

`0 <= left <= right <= 2**31 - 1`.

1. Return the bitwise AND of all integers in the inclusive range `[left, right]`.
2. The range can hold billions of numbers, so do not loop over it.
3. The answer is the common binary prefix of `left` and `right`, with zeros below it.
4. Shift both right until they are equal, then shift back.

```ts
rangeBitwiseAnd(5, 7) // 4
rangeBitwiseAnd(0, 0) // 0
// 6: left === right gives the number
rangeBitwiseAnd(6, 6)
rangeBitwiseAnd(1, 2147483647) // 0
// 1073741824: only bit 30 is shared
rangeBitwiseAnd(1500000000, 2000000000)
```

Edge cases:

- `left === right`: return the number itself.
- `left = 0`: always 0.
- A range that crosses a power of two: 0.
- The full range `[1, 2**31 - 1]`.
- Large endpoints that are close together.
