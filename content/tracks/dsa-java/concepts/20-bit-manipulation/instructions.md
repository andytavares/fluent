# Bit Manipulation

## What you'll learn

The bit-level toolkit interviews expect — XOR cancellation, `n & (n - 1)`, mask building, common-prefix reasoning — in the language where it's most natural to write. Java's `int` *is* a fixed 32-bit signed two's-complement value with no implicit conversion step, and it ships a dedicated unsigned-right-shift operator (`>>>`) that most languages don't have. You'll know exactly when a bit pattern reads as a negative `int`, why that's fine, and when you need `long` instead.

## Key concepts

### Java's `int` is always exactly 32 bits

Unlike JavaScript (64-bit doubles coerced through `ToInt32` for every bitwise op) or Python (arbitrary-precision integers), Java's `int` genuinely *is* a 32-bit signed two's-complement value, all the time — no conversion, no surprise. That makes bit tricks in Java the most direct of any language on this platform: what you write is what's stored.

```java
int a = 1 << 31;        // -2147483648 — bit 31 is the sign bit, no coercion needed
int b = 0xFFFFFFFF;      // -1 — a 32-bit hex literal reads its own bit pattern
int c = 2147483648;      // COMPILE ERROR — this value doesn't fit in int at all
```

That last line is the one real gotcha: values from `2^31` to `2^32 - 1` cannot be written as positive `int` literals in Java. If a problem describes an "unsigned 32-bit" input in that range, the *bit pattern* is representable as an `int` — it just prints as a negative number, and you write it with a hex literal (`0x80000000`) or `Integer.MIN_VALUE`-relative arithmetic instead of a decimal literal.

### `>>` vs `>>>` — the one distinction that causes real bugs

| Operator | Name | Fills vacated bits with | `-8 op 1` |
|----------|------|-------------------------|-----------|
| `>>` | arithmetic shift | copies of the sign bit | `-4` |
| `>>>` | logical shift | zeros | `2147483644` |

`>>` preserves the *numeric* meaning of signed values; `>>>` preserves the *bit pattern* view. When you're treating an `int` as a bag of 32 bits (popcount, bit reversal), you want `>>>` — looping with `n >>= 1` on a negative input sign-extends forever and never reaches 0.

### XOR — cancellation and parity

`^` is associative, commutative, `x ^ x == 0`, and `x ^ 0 == x`. That makes XOR a running "toggle log": fold it over a list and every value appearing an even number of times vanishes. One loop finds the unique element among pairs:

```java
int result = 0;
for (int x : nums) result ^= x;
```

### `n & (n - 1)` — clear the lowest set bit

Subtracting 1 flips the lowest set bit to 0 and everything below it to 1; ANDing keeps all *other* bits intact:

    n     = 10110100
    n - 1 = 10110011
    n&n-1 = 10110000

Loop it to count set bits in O(number of set bits); test `(n & (n - 1)) == 0` for power-of-two checks; in range-AND problems it strips right-end noise fast. Its sibling `n & -n` *isolates* the lowest set bit. This trick works identically whether `n` is positive or negative — Java's two's-complement representation makes it sign-agnostic.

### Simulating arithmetic on bits

Binary addition per column: digit sum = `a + b + carry`, write `sum & 1` (or `sum % 2`), carry `sum >> 1` (or `sum / 2`). This is exactly grade-school addition and it works on binary *strings* of any length — which matters because a 200-character binary string overflows every numeric type Java has short of `BigInteger`. When the input is a string, do string arithmetic with a `StringBuilder`.

### Complexity of the flagship problems

| Problem | Time | Space | Core idea |
|---------|------|-------|-----------|
| Add Binary | O(max(m, n)) | O(max(m, n)) | per-column carry over strings |
| Number of 1 Bits | O(set bits) | O(1) | `n & (n - 1)` |
| Single Number | O(n) | O(1) | XOR cancellation |
| Bitwise AND of Numbers Range | O(log n) | O(1) | shift to the common prefix |

## vs other languages

JavaScript's bitwise operators silently run every operand through `ToInt32` — a 64-bit double gets truncated to 32 bits and reinterpreted as signed, every single time. Java has no such step: there is no "double under the hood" to coerce, so there's no `ToInt32` surprise to learn, and no `x >>> 0` idiom needed to "fix" a negative-looking result back to unsigned — Java doesn't have an unsigned integer type at all, so a bit pattern with bit 31 set simply *is* a negative `int`, always, by design. `Integer.toUnsignedString(n)` and `Integer.toUnsignedLong(n)` exist specifically for the cases where you need to *print* or *compare* that pattern as if it were unsigned.

Python has arbitrary-precision integers, so `n & (n - 1)` on a negative Python `int` behaves completely differently (infinite two's-complement extension) — bit tricks that are second nature in Java or C need extra care in Python.

## Watch out

- **`n >>= 1` on negative input never terminates** a `while (n != 0)` loop — the sign bit refills forever. Use `n >>>= 1`, or clear bits with `n & (n - 1)` (which strictly decreases the set-bit count even for negatives).
- **Values from `2^31` to `2^32 - 1` can't be written as decimal `int` literals.** Use a hex literal (`0x80000000`, `0xFFFFFFFF`) or build the value with shifts — both represent the exact same bit pattern as a negative `int`.
- **Shift counts are taken mod 32 for `int`**: `x << 32 == x`, not 0 (and `x << 33 == x << 1`). A loop that shifts one place 32 times is fine; a single 32-place shift is a silent no-op.
- **Don't `Integer.parseInt(s, 2)` long binary strings.** `int` holds 32 bits, `long` holds 64 — Add Binary inputs can be hundreds of bits, past even `long`. Do string arithmetic (or use `BigInteger`, if allowed).
- **`x & 1` beats `x % 2` for odd tests on possibly-negative numbers** — `-3 % 2 == -1` in Java, which is truthy-looking but fails a naive `== 1` comparison; `x & 1` is always `0` or `1`.

## Problem walkthroughs

### Add Binary ★

**Problem.** Given two binary strings `a` and `b` (only `'0'`/`'1'`, no leading zeros except `"0"` itself), return their sum as a binary string. Inputs may be hundreds of digits long.

**Example.**

    a = "11",   b = "1"    → "100"
    a = "1010", b = "1011" → "10101"

**Steps.**
1. Numeric conversion is off the table — the strings can exceed 64 bits. Add column by column instead, exactly like decimal addition by hand.
2. Set indexes `i = a.length() - 1`, `j = b.length() - 1`, `carry = 0`, and a `StringBuilder` for the output.
3. While `i >= 0 || j >= 0 || carry != 0`: `sum = carry + (i >= 0 ? a.charAt(i--) - '0' : 0) + (j >= 0 ? b.charAt(j--) - '0' : 0)`; append `(char) ('0' + (sum & 1))`; set `carry = sum >> 1`.
4. The digits were produced least-significant first — `reverse()` the builder before returning. (Appending and reversing once is O(n); prepending to a `String` every iteration is O(n²).)
5. The `|| carry != 0` in the loop condition handles the final overflow column (`"11" + "1"` needs a fourth digit) with no special case.

**Complexity.** O(max(m, n)) time and space — one pass over the longer string.

### Reverse Bits

**Problem.** Given a 32-bit input, return the `int` whose bit pattern is the reversal (bit 0 <-> bit 31, bit 1 <-> bit 30, ...).

**Example.**

    0b00000010100101000001111010011100 (43261596)
    → 0b00111001011110000010100101000000 (964176192)

**Steps.**
1. Loop exactly 32 times — leading zeros of the input become trailing bits of the output, so you cannot stop early at `n == 0`.
2. Each iteration: `result = (result << 1) | (n & 1)` — make room, bring in the input's lowest bit — then `n >>>= 1` (logical shift; `>>` would drag sign bits into a "value" you're treating as a bit bag).
3. Return `result`. If the input's bit 0 was 1, the output's bit 31 is set and `result` prints as a negative `int` — that's expected; it's the same bit pattern the problem describes as an "unsigned" value.
4. Follow-up ("called many times"): reverse byte-by-byte with a 256-entry lookup table, or use the O(log 32) mask-swap ladder (swap halves, then quarters, ...).

**Complexity.** O(32) = O(1) time / O(1) space.

### Number of 1 Bits ★

**Problem.** Return the number of set bits (the population count / Hamming weight) in the 32-bit representation of `n`.

**Example.**

    11                → 3   (0b1011)
    bit 31 alone      → 1   (0x80000000)

**Steps.**
1. No normalization needed — `n` is already a 32-bit `int`, positive or negative.
2. Loop while `n != 0`: `n = n & (n - 1)`, increment a counter. Each iteration erases exactly the lowest set bit, so the loop runs once per 1-bit — 32 times worst case, not 32 times always. This works unchanged for negative `n`.
3. Alternative: 32 iterations of `count += n & 1; n >>>= 1` — correct, just always 32 steps. Know both; say why you chose one. (`Integer.bitCount(n)` is the library one-liner — mention it, then implement the loop yourself.)

**Complexity.** O(set bits) time / O(1) space.

### Single Number ★

**Problem.** Every element of `nums` appears exactly twice except one, which appears once. Find it in O(n) time and O(1) space — a hash set is the obvious answer and explicitly not allowed.

**Example.**

    [2,2,1]     → 1
    [4,1,2,1,2] → 4

**Steps.**
1. XOR the entire array into an accumulator starting at 0.
2. Commutativity lets you mentally reorder the fold so each pair sits together: `x ^ x == 0`, pairs annihilate, and `acc ^ 0 == acc` leaves the singleton untouched.
3. Return the accumulator. Works with negatives unchanged — XOR treats the two's-complement pattern as just bits.

**Complexity.** O(n) time / O(1) space — the canonical XOR-cancellation problem.

### Single Number II

**Problem.** Same setup, but every other element appears exactly **three** times; one appears once. Same O(n)/O(1) bar.

**Example.**

    [2,2,3,2]       → 3
    [0,1,0,1,0,1,99] → 99

**Steps.**
1. XOR alone can't help — triples don't cancel. Generalize: for each of the 32 bit positions, count how many array elements have that bit set. Elements appearing 3x contribute multiples of 3 to every position; the singleton's bits are the positions where `count % 3 == 1`.
2. Per-position version: for bit `i` in 0..31, sum `(x >>> i) & 1` over the array; if the total mod 3 is 1, set bit `i` in the result.
3. Sign handling: `result |= 1 << i` does the right thing automatically for bit 31 — signed left-shift semantics build the correct two's-complement pattern.
4. The slick two-variable automaton (`ones`, `twos`: `ones = (ones ^ x) & ~twos; twos = (twos ^ x) & ~ones`) tracks the count-mod-3 state in O(1) per element with no inner loop — worth knowing by name, but derive the counting version first.

**Complexity.** O(32n) = O(n) time / O(1) space.

### Bitwise AND of Numbers Range ★

**Problem.** Given `left <= right` (both in `[0, 2^31 - 1]`), return the AND of **every** integer in `[left, right]` — conceptually `left & (left+1) & ... & right`, but the range can span two billion values.

**Example.**

    left = 5, right = 7          → 4    (0b101 & 0b110 & 0b111 = 0b100)
    left = 0, right = 2^31 - 1   → 0

**Steps.**
1. Key insight: the AND of a range is the **common binary prefix** of `left` and `right`, padded with zeros. Below the highest differing bit, every pattern occurs somewhere in the range (crossing from `...0111` to `...1000` zeroes each position at least once), so all lower bits AND to 0.
2. Shift both endpoints right in lockstep (with `>>>`), counting steps, until `left == right` — what remains *is* the common prefix.
3. Return `left << shift` to pad the prefix back to position. The result can't overflow into the sign bit: the prefix restored to its original position is <= `right` <= `2^31 - 1`.
4. Kernighan variant worth knowing: `while (left < right) right &= right - 1; return right` — repeatedly clearing `right`'s lowest set bit also converges on the common prefix.

**Complexity.** O(log n) <= 31 iterations / O(1) space — never enumerate the range.

## Interview follow-ups

- After **Single Number**: "Two elements appear once, the rest twice?" (XOR all → `a ^ b`; split the array by any set bit of that XOR — `xor & -xor` — and reduce each side separately.)
- After **Single Number II**: "Every element k times except one?" (per-bit counting mod k works for any k; the two-variable trick is specific to k = 3.)
- After **Number of 1 Bits**: "Popcount for every number 0..n?" (DP: `count[i] = count[i >> 1] + (i & 1)` — O(n) total.)
- After **Bitwise AND of Numbers Range**: "OR of a range instead?" (common prefix again, but the differing suffix becomes all *ones*: prefix + `(1 << shift) - 1`.)
- General: "Why does Java need no `ToInt32`-style fixup, unlike JavaScript?" (`int` genuinely is a 32-bit two's-complement store; there's nothing to coerce from.)

## The task

Four bit problems. No hash maps, no sorting, no numeric conversion of long binary strings — each has a stated bit-level technique and complexity bar.

### `addBinary(String a, String b)`

`a` and `b` are binary strings (`'0'`/`'1'` only, no leading zeros except `"0"` itself). Return their sum as a binary string, same format. Inputs can be **hundreds of digits** — far past `long`'s 64-bit capacity — so `Long.parseLong`/`Integer.parseInt` conversion produces wrong answers; add the strings column by column with a carry. O(max(m, n)) time.

```java
addBinary("11", "1");      // "100"
addBinary("1010", "1011"); // "10101"
addBinary("0", "0");       // "0"
addBinary("1".repeat(100), "1"); // "1" + "0".repeat(100)
```

Edge cases: `"0" + "0"` (return `"0"`, not `"00"`), very different lengths, a final carry creating an extra digit, 100+ digit inputs.

### `hammingWeight(int n)`

Return the number of set bits in the 32-bit representation of `n`. Because Java's `int` is signed, values with bit 31 set — the top half of the "unsigned 32-bit" range — arrive as **negative** `int`s (write them as hex literals, e.g. `0x80000000`, or via `Integer.MIN_VALUE`). Clear bits with `n & (n - 1)` — no normalization needed, the trick works the same for negative `n`.

```java
hammingWeight(11);          // 3   (0b1011)
hammingWeight(128);         // 1   (0b10000000)
hammingWeight(0);           // 0
hammingWeight(0xFFFFFFFD);  // 31  (all bits except bit 1)
hammingWeight(0x80000000);  // 1   (only bit 31 — reads as Integer.MIN_VALUE)
```

Edge cases: 0, exactly one bit set (including bit 31 alone), all 32 bits set (`0xFFFFFFFF` → 32).

### `singleNumber(int[] nums)`

Every element of `nums` appears exactly twice, except one element that appears exactly once. Return that element in O(n) time and **O(1) extra space** — no `HashMap`/`HashSet` tally. XOR the array: pairs cancel, the singleton survives.

```java
singleNumber(new int[]{2, 2, 1});       // 1
singleNumber(new int[]{4, 1, 2, 1, 2}); // 4
singleNumber(new int[]{1});             // 1
singleNumber(new int[]{-3, 7, -3});     // 7
```

Edge cases: single-element array, negative values, the singleton at the start, middle, or end.

### `rangeBitwiseAnd(int left, int right)`

Return the bitwise AND of all integers in the inclusive range `[left, right]`, with `0 <= left <= right <= 2^31 - 1`. The range may contain billions of numbers, so looping over it is out — the answer is the common binary prefix of `left` and `right` with zeros below it: shift both right until they're equal, then shift back.

```java
rangeBitwiseAnd(5, 7);          // 4
rangeBitwiseAnd(0, 0);          // 0
rangeBitwiseAnd(6, 6);          // 6   (left == right → the number itself)
rangeBitwiseAnd(1, 2147483647); // 0
rangeBitwiseAnd(1500000000, 2000000000); // 1073741824  (only the shared bit 30 survives)
```

Edge cases: `left == right`, `left = 0` (always 0), a range crossing a power of two (result 0), the full `[1, 2^31 - 1]` range, large near-equal endpoints.
