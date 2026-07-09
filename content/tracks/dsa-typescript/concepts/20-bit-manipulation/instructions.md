# Bit Manipulation

## What you'll learn

The bit-level toolkit interviews expect — XOR cancellation, `n & (n - 1)`, mask building, common-prefix reasoning — plus the part that's specific to JavaScript/TypeScript at runtime: every bitwise operator secretly converts your number to a **32-bit signed integer** and back. TypeScript's type system adds no new bitwise semantics — `number` is still a 64-bit float under the hood — so you'll know when `>>` silently sign-extends your value into an infinite loop, why `>>> 0` is the idiom for "treat this as unsigned," and when bits can't save you at all (binary strings longer than the integer type).

## Key concepts

### TypeScript's 32-bit window (inherited from JS)

`number` is a 64-bit float, but `& | ^ ~ << >>` all run ToInt32 first: the operand is truncated to its low 32 bits and *reinterpreted as signed two's complement*. Results come back the same way:

```ts
2 ** 32 | 0      // 0        — bit 32 falls off the edge
(2 ** 31) | 0    // -2147483648 — bit 31 is the sign bit
1 << 31          // -2147483648 — same value, built by shifting
4294967295 | 0   // -1       — 32 ones reads as -1 in two's complement
```

Two consequences: bitwise code is only trustworthy for values that fit in 32 bits, and any value with bit 31 set will *print* negative even when you're thinking of it as unsigned. The type checker won't warn you — `number` covers both regimes.

### `>>` vs `>>>` — the one distinction that causes real bugs

| Operator | Name | Fills vacated bits with | `-8 op 1` |
|----------|------|-------------------------|-----------|
| `>>` | arithmetic shift | copies of the sign bit | `-4` |
| `>>>` | logical shift | zeros | `2147483644` |

`>>` preserves the *numeric* meaning of signed values; `>>>` preserves the *bit pattern* view. When you're treating a number as a bag of 32 bits (popcount, bit reversal), you want `>>>` — looping with `n >>= 1` on a negative input sign-extends forever and never reaches 0.

`x >>> 0` is the standard trick to read a bit pattern as an unsigned number: it shifts by zero (a no-op on the bits) but returns an unsigned interpretation, so `(-1) >>> 0 === 4294967295`. It's how you fix a "negative" result after building bits with `<<`.

### XOR — cancellation and parity

`^` is associative, commutative, `x ^ x === 0`, and `x ^ 0 === x`. That makes XOR a running "toggle log": fold it over a list and every value appearing an even number of times vanishes. One line finds the unique element among pairs:

```ts
nums.reduce((acc, x) => acc ^ x, 0)
```

### `n & (n - 1)` — clear the lowest set bit

Subtracting 1 flips the lowest set bit to 0 and everything below it to 1; ANDing keeps all *other* bits intact:

    n     = 10110100
    n - 1 = 10110011
    n&n-1 = 10110000

Loop it to count set bits in O(number of set bits); test `(n & (n - 1)) === 0` for power-of-two checks; in range-AND problems it strips right-end noise fast. Its sibling `n & -n` *isolates* the lowest set bit.

### Simulating arithmetic on bits

Binary addition per column: digit sum = `a + b + carry`, write `sum & 1` (or `sum % 2`), carry `sum >> 1` (or `floor(sum / 2)`). This is exactly grade-school addition and it works on binary *strings* of any length — which matters because a 200-character binary string overflows every numeric type TS/JS has short of `bigint`. When the input is a string, do string arithmetic.

### Complexity of the flagship problems

| Problem | Time | Space | Core idea |
|---------|------|-------|-----------|
| Add Binary | O(max(m, n)) | O(max(m, n)) | per-column carry over strings |
| Number of 1 Bits | O(set bits) | O(1) | `n & (n - 1)` |
| Single Number | O(n) | O(1) | XOR cancellation |
| Bitwise AND of Numbers Range | O(log n) | O(1) | shift to the common prefix |

## Watch out

- **`n >>= 1` on negative input never terminates** a `while (n !== 0)` loop — the sign bit refills forever. Use `n >>>= 1`, or clear bits with `n & (n - 1)` (which strictly decreases the set-bit count even for negatives).
- **Bit 31 makes results print negative.** `(result << 1) | bit` builds a correct bit *pattern*, but if bit 31 ends up set the number is negative. Finish unsigned-flavored functions with `>>> 0`.
- **Shift counts are taken mod 32**: `x << 32 === x`, not 0. A loop that shifts one place 32 times is fine; a single 32-place shift is a silent no-op.
- **Don't `parseInt(s, 2)` long binary strings.** Doubles carry 53 bits of integer precision; beyond that, digits are silently rounded away. Add Binary inputs can be hundreds of bits — do string arithmetic (or `bigint`, if allowed).
- **`&`, `|`, `^` on values above 2³² − 1 truncate first.** `2 ** 32 | 1 === 1`. Bitwise tricks and `Number.MAX_SAFE_INTEGER`-scale values don't mix.
- **`1 << 31` is negative.** For the unsigned constant 2147483648 write `2 ** 31` or `(1 << 31) >>> 0`.
- **`x & 1` beats `x % 2` for odd tests on possibly-negative numbers** — `-3 % 2 === -1`, which is truthy but surprises `=== 1` comparisons.

## Problem walkthroughs

### Add Binary ★

**Problem.** Given two binary strings `a` and `b` (only `'0'`/`'1'`, no leading zeros except `"0"` itself), return their sum as a binary string. Inputs may be hundreds of digits long.

**Example.**

    a = "11",   b = "1"    → "100"
    a = "1010", b = "1011" → "10101"

**Steps.**
1. Numeric conversion is off the table — the strings can exceed 53 bits. Add column by column instead, exactly like decimal addition by hand.
2. Set indexes `i = a.length - 1`, `j = b.length - 1`, `carry = 0`, and an output array of digits.
3. While `i >= 0 || j >= 0 || carry`: `sum = carry + (a[i] or 0) + (b[j] or 0)`; append `sum & 1`; set `carry = sum >> 1`; decrement both indexes.
4. The digits were produced least-significant first — reverse and join. (Appending to an array and reversing once is O(n); prepending to a string every iteration is O(n²).)
5. The `|| carry` in the loop condition handles the final overflow column (`"11" + "1"` needs a fourth digit) with no special case.

**Complexity.** O(max(m, n)) time and space — one pass over the longer string.

### Reverse Bits

**Problem.** Given a 32-bit unsigned integer, return the unsigned integer whose 32-bit representation is the reversal (bit 0 ↔ bit 31, bit 1 ↔ bit 30, …).

**Example.**

    0b00000010100101000001111010011100 (43261596)
    → 0b00111001011110000010100101000000 (964176192)

**Steps.**
1. Loop exactly 32 times — leading zeros of the input become trailing bits of the output, so you cannot stop early at `n === 0` ... though you *can*, if you remember the result still needs shifting; fixed 32 iterations is simpler and constant anyway.
2. Each iteration: `result = (result << 1) | (n & 1)` — make room, bring in the input's lowest bit — then `n >>>= 1` (logical shift; `>>` would drag sign bits into a "value" you're treating as a bit bag).
3. Return `result >>> 0`. If the input's bit 0 was 1, the output's bit 31 is set and the signed result is negative; `>>> 0` reinterprets the identical bit pattern as unsigned.
4. Follow-up ("called many times"): reverse byte-by-byte with a 256-entry lookup table, or use the O(log 32) mask-swap ladder (swap halves, then quarters, …).

**Complexity.** O(32) = O(1) time / O(1) space.

### Number of 1 Bits ★

**Problem.** Return the number of set bits (the population count / Hamming weight) in the 32-bit representation of a non-negative integer `n` (up to 2³² − 1).

**Example.**

    11         (0b1011)  → 3
    2147483648 (bit 31)  → 1

**Steps.**
1. Normalize once: `n = n >>> 0`. Inputs like 2³¹ and above don't fit in the signed range; this fixes the interpretation without changing any bits.
2. Loop while `n !== 0`: `n = (n & (n - 1)) >>> 0`, increment a counter. Each iteration erases exactly the lowest set bit, so the loop runs once per 1-bit — 32 times worst case, not 32 times always.
3. The `>>> 0` inside the loop keeps the value in unsigned form so the `!== 0` test is about bits, not sign.
4. Alternative: 32 iterations of `count += n & 1; n >>>= 1` — correct, just always 32 steps. Know both; say why you chose one.

**Complexity.** O(set bits) time / O(1) space.

### Single Number ★

**Problem.** Every element of `nums` appears exactly twice except one, which appears once. Find it in O(n) time and O(1) space — a hash map is the obvious answer and explicitly not allowed.

**Example.**

    [2,2,1]     → 1
    [4,1,2,1,2] → 4

**Steps.**
1. XOR the entire array into an accumulator starting at 0.
2. Commutativity lets you mentally reorder the fold so each pair sits together: `x ^ x === 0`, pairs annihilate, and `acc ^ 0 === acc` leaves the singleton untouched.
3. Return the accumulator. Works with negatives unchanged — XOR treats the two's-complement pattern as just bits.

**Complexity.** O(n) time / O(1) space — the canonical XOR-cancellation problem.

### Single Number II

**Problem.** Same setup, but every other element appears exactly **three** times; one appears once. Same O(n)/O(1) bar.

**Example.**

    [2,2,3,2]       → 3
    [0,1,0,1,0,1,99] → 99

**Steps.**
1. XOR alone can't help — triples don't cancel. Generalize: for each of the 32 bit positions, count how many array elements have that bit set. Elements appearing 3× contribute multiples of 3 to every position; the singleton's bits are the positions where `count % 3 === 1`.
2. Per-position version: for bit `i` in 0..31, sum `(x >>> i) & 1` over the array; if the total mod 3 is 1, set bit `i` in the result.
3. Sign handling: if bit 31 comes out set, the answer is negative — build the result with `result |= 1 << i` (signed semantics do the right thing automatically), or convert at the end with `| 0`.
4. The slick two-variable automaton (`ones`, `twos`: `ones = (ones ^ x) & ~twos; twos = (twos ^ x) & ~ones`) tracks the count-mod-3 state in O(1) per element with no inner loop — worth knowing by name, but derive the counting version first.

**Complexity.** O(32n) = O(n) time / O(1) space.

### Bitwise AND of Numbers Range ★

**Problem.** Given `left <= right` (both in `[0, 2³¹ − 1]`), return the AND of **every** integer in `[left, right]` — conceptually `left & (left+1) & … & right`, but the range can span two billion values.

**Example.**

    left = 5, right = 7          → 4    (0b101 & 0b110 & 0b111 = 0b100)
    left = 0, right = 2**31 - 1  → 0

**Steps.**
1. Key insight: the AND of a range is the **common binary prefix** of `left` and `right`, padded with zeros. Below the highest differing bit, every pattern occurs somewhere in the range (crossing from `…0111` to `…1000` zeroes each position at least once), so all lower bits AND to 0.
2. Shift both endpoints right in lockstep, counting steps, until `left === right` — what remains *is* the common prefix.
3. Return `left << shift` to pad the prefix back to position. The result can't overflow into the sign bit: the prefix restored to its original position is ≤ `right` ≤ 2³¹ − 1.
4. Kernighan variant worth knowing: `while (left < right) right &= right - 1; return right` — repeatedly clearing `right`'s lowest set bit also converges on the common prefix.

**Complexity.** O(log n) ≤ 31 iterations / O(1) space — never enumerate the range.

## Interview follow-ups

- After **Single Number**: "Two elements appear once, the rest twice?" (XOR all → `a ^ b`; split the array by any set bit of that XOR — `xor & -xor` — and reduce each side separately.)
- After **Single Number II**: "Every element k times except one?" (per-bit counting mod k works for any k; the two-variable trick is specific to k = 3.)
- After **Number of 1 Bits**: "Popcount for every number 0..n?" (DP: `count[i] = count[i >> 1] + (i & 1)` — O(n) total.)
- After **Bitwise AND of Numbers Range**: "OR of a range instead?" (common prefix again, but the differing suffix becomes all *ones*: prefix + `(1 << shift) - 1`.)
- General: "Why does your bit-reversal return a negative number, and how do you fix it?" (`<<` builds a signed int32; `>>> 0` reinterprets the same bits as unsigned.)

## The task

Four bit problems. No hash maps, no sorting, no numeric conversion of long binary strings — each has a stated bit-level technique and complexity bar.

### `addBinary(a: string, b: string): string`

`a` and `b` are binary strings (`'0'`/`'1'` only, no leading zeros except `"0"` itself). Return their sum as a binary string, same format. Inputs can be **hundreds of digits** — far past `number`'s 53-bit integer precision — so `parseInt`/`Number` conversion produces wrong answers; add the strings column by column with a carry. O(max(m, n)) time.

```ts
addBinary("11", "1");      // "100"
addBinary("1010", "1011"); // "10101"
addBinary("0", "0");       // "0"
addBinary("1".repeat(100), "1"); // "1" + "0".repeat(100)
```

Edge cases: `"0" + "0"` (return `"0"`, not `"00"`), very different lengths, a final carry creating an extra digit, 100+ digit inputs.

### `hammingWeight(n: number): number`

Return the number of set bits in the 32-bit representation of `n`, where `0 <= n <= 2**32 - 1`. Values with bit 31 set (2147483648 and up) are the trap: coerced to int32 they're negative, and a `>>`-based loop never terminates. Normalize with `n >>> 0` and clear bits with `n & (n - 1)` (re-normalizing with `>>> 0` as you go), or shift with `>>>`.

```ts
hammingWeight(11);         // 3   (0b1011)
hammingWeight(128);        // 1   (0b10000000)
hammingWeight(0);          // 0
hammingWeight(4294967293); // 31  (all bits except bit 1)
hammingWeight(2147483648); // 1   (only bit 31)
```

Edge cases: 0, exactly one bit set (including bit 31 alone), all 32 bits set (4294967295 → 32).

### `singleNumber(nums: number[]): number`

Every element of `nums` appears exactly twice, except one element that appears exactly once. Return that element in O(n) time and **O(1) extra space** — no Map/Set/object tally. XOR the array: pairs cancel, the singleton survives.

```ts
singleNumber([2, 2, 1]);       // 1
singleNumber([4, 1, 2, 1, 2]); // 4
singleNumber([1]);             // 1
singleNumber([-3, 7, -3]);     // 7
```

Edge cases: single-element array, negative values, the singleton at the start, middle, or end.

### `rangeBitwiseAnd(left: number, right: number): number`

Return the bitwise AND of all integers in the inclusive range `[left, right]`, with `0 <= left <= right <= 2**31 - 1`. The range may contain billions of numbers, so looping over it is out — the answer is the common binary prefix of `left` and `right` with zeros below it: shift both right until they're equal, then shift back.

```ts
rangeBitwiseAnd(5, 7);          // 4
rangeBitwiseAnd(0, 0);          // 0
rangeBitwiseAnd(6, 6);          // 6   (left === right → the number itself)
rangeBitwiseAnd(1, 2147483647); // 0
rangeBitwiseAnd(1500000000, 2000000000); // 1073741824  (only the shared bit 30 survives)
```

Edge cases: `left === right`, `left = 0` (always 0), a range crossing a power of two (result 0), the full `[1, 2**31 - 1]` range, large near-equal endpoints.
