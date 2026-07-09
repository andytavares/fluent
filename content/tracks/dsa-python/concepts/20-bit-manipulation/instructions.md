# Bit Manipulation

## What you'll learn

The bit-level toolkit interviews expect — XOR cancellation, `n & (n - 1)`, mask building, common-prefix reasoning — plus the part that's specific to Python: **integers have no fixed width**. There's no ToInt32, no automatic wraparound, no sign bit unless you build one. That's a relief for arithmetic (`add_binary` never worries about precision) and a trap for anything that's supposed to simulate a fixed-width register (`reverse_bits`, per-bit counting on negative numbers) — those need an explicit mask, and you decode the sign back out by hand.

## Key concepts

### Python ints are unbounded — nothing truncates for you

`& | ^ ~ << >>` operate on Python's arbitrary-precision integers directly; there's no hidden conversion to a 32-bit or 64-bit word the way JavaScript's ToInt32 or C's `int` would do it:

```python
2 ** 32 & 0xFFFFFFFF   # 0            — masking off the low 32 bits explicitly
(2 ** 31) & 0xFFFFFFFF # 2147483648   — stays positive; Python has no int32 sign bit
1 << 31                # 2147483648   — never silently negative
```

If a problem is defined in terms of a 32-bit register (Hamming Weight, Reverse Bits), you must build that window yourself with `& 0xFFFFFFFF`. Nothing does it for you, and nothing stops you from forgetting to.

### Emulating a fixed-width window: mask in, decode out

Two moves cover almost every "pretend this is a 32-bit int" problem:

```python
masked = value & 0xFFFFFFFF          # keep only the low 32 bits

# Two's-complement decode: if bit 31 is set, the 32-bit value represents
# a negative number in the original (signed) problem domain.
if masked & 0x80000000:
    signed = masked - (1 << 32)
else:
    signed = masked
```

You only need the decode step when the *problem* is defined over signed 32-bit integers and your computation built the answer bit-by-bit (as in Single Number II, walkthrough below). If the problem is defined over an **unsigned** range (Hamming Weight, Reverse Bits both take `0 <= n <= 2**32 - 1` and return a value in the same range), skip the decode — the masked value already *is* the answer.

### Negative numbers and Python's bitwise operators

Python represents negative integers as if they had infinitely many leading 1 bits (true two's complement, just not width-limited): `~x == -x - 1`, and `-1 & anything == anything`. This makes XOR-based cancellation work correctly on negative inputs with zero extra code — `x ^ x == 0` holds no matter the sign. It also means a right-shift loop that expects to reach exactly `0` (`while n: n >>= 1`) never terminates on a negative `n`, because `>>` sign-extends forever. Mask first if you need a bounded loop over a value that might be negative.

### XOR — cancellation and parity

`^` is associative, commutative, `x ^ x == 0`, and `x ^ 0 == x`. That makes XOR a running "toggle log": fold it over a list and every value appearing an even number of times vanishes. One line finds the unique element among pairs:

```python
from functools import reduce
reduce(lambda acc, x: acc ^ x, nums, 0)
```

### `n & (n - 1)` — clear the lowest set bit

Subtracting 1 flips the lowest set bit to 0 and everything below it to 1; ANDing keeps all *other* bits intact:

    n     = 10110100
    n - 1 = 10110011
    n&n-1 = 10110000

Loop it to count set bits in O(number of set bits); test `n & (n - 1) == 0` for power-of-two checks (`n > 0` required); in range-AND problems it strips right-end noise fast. Its sibling `n & -n` *isolates* the lowest set bit — and on Python's unbounded negative representation that isolation still works correctly, unlike a fixed-width language where `-n` would need explicit two's-complement construction.

### Simulating arithmetic on bits

Binary addition per column: digit sum = `a + b + carry`, write `sum & 1` (or `sum % 2`), carry `sum >> 1` (or `sum // 2`). This is exactly grade-school addition and it works on binary *strings* of any length. Python's `int(s, 2)` could parse a whole binary string at once without any precision loss (unlike JavaScript's `Number`) — but the manual carry walk is still the expected technique here: it's O(max(m, n)) and is the shape every "combine two representations digit by digit" problem takes, string or not.

### Complexity of the flagship problems

| Problem | Time | Space | Core idea |
|---------|------|-------|-----------|
| Add Binary | O(max(m, n)) | O(max(m, n)) | per-column carry over strings |
| Number of 1 Bits | O(set bits) | O(1) | `n & (n - 1)` |
| Single Number | O(n) | O(1) | XOR cancellation |
| Bitwise AND of Numbers Range | O(log n) | O(1) | shift to the common prefix |

## Watch out

- **Nothing masks for you.** A problem that says "32-bit unsigned integer" means you apply `& 0xFFFFFFFF` yourself wherever the value might otherwise grow past 32 bits (built via left shifts) or come in already large.
- **`while n:` with `n >>= 1` never terminates on negative `n`** — sign extension refills the top forever. Mask to `0xFFFFFFFF` first if the value could be negative, or use `n & (n - 1)` (which strictly reduces the set-bit count even for negatives, though "set-bit count" of a negative Python int is infinite unless you've masked it into a fixed width first).
- **Building a value with left shifts can silently grow past your intended width.** Python won't clip it — mask explicitly: `result = (result << 1 | bit) & 0xFFFFFFFF`.
- **Reading a masked value's sign requires an explicit decode.** `value & 0xFFFFFFFF` is always non-negative in Python (it's just a number, no sign bit exists structurally) — checking `masked & 0x80000000` and subtracting `1 << 32` is how you recover "this represents a negative number in a signed 32-bit domain."
- **`x % 2` is fine for parity in Python**, unlike some languages — Python's `%` always returns a non-negative result for a positive modulus (`-3 % 2 == 1`), so `x % 2 == 1` correctly tests "odd" even for negative `x`. (`x & 1` still works too, and is the more bit-manipulation-idiomatic choice.)
- **Don't reach for `bin()`/`int(s, 2)` as a substitute for understanding the manual technique** — they're correct and fast in Python (no precision ceiling), but the interview is testing the per-column/per-bit algorithm, not the standard library.

## Problem walkthroughs

### Add Binary ★

**Problem.** Given two binary strings `a` and `b` (only `'0'`/`'1'`, no leading zeros except `"0"` itself), return their sum as a binary string. Inputs may be hundreds of digits long.

**Example.**

    a = "11",   b = "1"    → "100"
    a = "1010", b = "1011" → "10101"

**Steps.**
1. Add column by column, exactly like decimal addition by hand — this is the expected technique regardless of the fact that Python's own integers could hold a 200-digit binary number exactly.
2. Set indexes `i = len(a) - 1`, `j = len(b) - 1`, `carry = 0`, and a list of output digits.
3. While `i >= 0 or j >= 0 or carry`: `total = carry + (int(a[i]) if i >= 0 else 0) + (int(b[j]) if j >= 0 else 0)`; append `total & 1`; set `carry = total >> 1`; decrement both indexes.
4. The digits were produced least-significant first — reverse and join. (Appending to a list and reversing once is O(n); prepending to a string every iteration is O(n²).)
5. The `or carry` in the loop condition handles the final overflow column (`"11" + "1"` needs a fourth digit) with no special case.

**Complexity.** O(max(m, n)) time and space — one pass over the longer string.

### Reverse Bits

**Problem.** Given a 32-bit unsigned integer, return the unsigned integer whose 32-bit representation is the reversal (bit 0 ↔ bit 31, bit 1 ↔ bit 30, …).

**Example.**

    0b00000010100101000001111010011100 (43261596)
    → 0b00111001011110000010100101000000 (964176192)

**Steps.**
1. Loop exactly 32 times — leading zeros of the input become trailing bits of the output, so you cannot stop early at `n == 0`.
2. Each iteration: `result = (result << 1) | (n & 1)` — make room, bring in the input's lowest bit — then `n >>= 1` (safe here because the problem guarantees `n >= 0`, so no sign-extension risk).
3. **This is the step Python needs that JavaScript doesn't**: after the loop, mask explicitly — `result &= 0xFFFFFFFF`. In JavaScript, `<<` automatically wraps to a 32-bit window (via ToInt32) and `>>> 0` reinterprets it as unsigned; in Python `result` just keeps growing unless you truncate it yourself. Since this problem's output is defined as unsigned, the masked value *is* the final answer — no sign decode needed.
4. Follow-up ("called many times"): reverse byte-by-byte with a 256-entry lookup table, or use the O(log 32) mask-swap ladder (swap halves, then quarters, …).

**Complexity.** O(32) = O(1) time / O(1) space.

### Number of 1 Bits ★

**Problem.** Return the number of set bits (the population count / Hamming weight) in the 32-bit representation of a non-negative integer `n` (up to 2³² − 1).

**Example.**

    11         (0b1011)  → 3
    2147483648 (bit 31)  → 1

**Steps.**
1. The input is already constrained to `0 <= n <= 2**32 - 1` — a valid unsigned 32-bit value — so no masking is needed just to read it. (Contrast with a signed-32-bit-input version, where you'd mask first.)
2. Loop while `n != 0`: `n = n & (n - 1)`, increment a counter. Each iteration erases exactly the lowest set bit, so the loop runs once per 1-bit — 32 times worst case, not 32 times always.
3. Alternative: `bin(n).count("1")` — correct and idiomatic in real code; know the manual technique for the interview, mention the one-liner as the production answer.
4. Alternative loop: 32 fixed iterations of `count += n & 1; n >>= 1` — correct, just always 32 steps regardless of how many bits are set.

**Complexity.** O(set bits) time / O(1) space.

### Single Number ★

**Problem.** Every element of `nums` appears exactly twice except one, which appears once. Find it in O(n) time and O(1) space — a hash map is the obvious answer and explicitly not allowed.

**Example.**

    [2,2,1]     → 1
    [4,1,2,1,2] → 4

**Steps.**
1. XOR the entire list into an accumulator starting at 0.
2. Commutativity lets you mentally reorder the fold so each pair sits together: `x ^ x == 0`, pairs annihilate, and `acc ^ 0 == acc` leaves the singleton untouched.
3. Return the accumulator. Works with negatives unchanged — Python's `^` operates correctly on its infinite-precision two's-complement representation of negative ints with no masking required.

**Complexity.** O(n) time / O(1) space — the canonical XOR-cancellation problem.

### Single Number II

**Problem.** Same setup, but every other element appears exactly **three** times; one appears once. Same O(n)/O(1) bar. The singleton may be negative.

**Example.**

    [2,2,3,2]        → 3
    [0,1,0,1,0,1,99] → 99

**Steps.**
1. XOR alone can't help — triples don't cancel. Generalize: for each of the 32 bit positions, count how many list elements have that bit set. Elements appearing 3× contribute multiples of 3 to every position; the singleton's bits are the positions where `count % 3 == 1`.
2. Per-position version: for bit `i` in `range(32)`, sum `(x >> i) & 1` over the list; if the total mod 3 is 1, set bit `i` in the result with `result |= 1 << i`.
3. **This is where the two's-complement decode matters**: if the singleton is negative, bit 31 of the true answer is set, but the loop above only ever OR's in *positive* contributions — it builds the unsigned 32-bit pattern of the answer. Once the loop finishes, decode the sign: if `result & 0x80000000`, the true value is `result - (1 << 32)`; otherwise it's `result` unchanged. Skipping this step returns a large positive number instead of the correct negative one.
4. The slick two-variable automaton (`ones`, `twos`: `ones = (ones ^ x) & ~twos; twos = (twos ^ x) & ~ones`) tracks the count-mod-3 state in O(1) per element with no inner loop — worth knowing by name, but derive the counting version (and its sign decode) first.

**Complexity.** O(32n) = O(n) time / O(1) space.

### Bitwise AND of Numbers Range ★

**Problem.** Given `left <= right` (both in `[0, 2³¹ − 1]`), return the AND of **every** integer in `[left, right]` — conceptually `left & (left+1) & … & right`, but the range can span two billion values.

**Example.**

    left = 5, right = 7          → 4    (0b101 & 0b110 & 0b111 = 0b100)
    left = 0, right = 2**31 - 1  → 0

**Steps.**
1. Key insight: the AND of a range is the **common binary prefix** of `left` and `right`, padded with zeros. Below the highest differing bit, every pattern occurs somewhere in the range (crossing from `…0111` to `…1000` zeroes each position at least once), so all lower bits AND to 0.
2. Shift both endpoints right in lockstep (`left >>= 1; right >>= 1`; both inputs are non-negative, so no sign-extension concern), counting steps, until `left == right` — what remains *is* the common prefix.
3. Return `left << shift` to pad the prefix back to position. The result can't overflow a signed 32-bit window in the *problem's* domain: the prefix restored to its original position is ≤ `right` ≤ 2³¹ − 1 — but note Python itself would happily represent a larger value too; the bound comes from the math, not the language.
4. Kernighan variant worth knowing: `while left < right: right &= right - 1` then `return right` — repeatedly clearing `right`'s lowest set bit also converges on the common prefix.

**Complexity.** O(log n) ≤ 31 iterations / O(1) space — never enumerate the range.

## Interview follow-ups

- After **Single Number**: "Two elements appear once, the rest twice?" (XOR all → `a ^ b`; split the list by any set bit of that XOR — `xor & -xor` — and reduce each side separately.)
- After **Single Number II**: "Every element k times except one?" (per-bit counting mod k works for any k; the two-variable trick is specific to k = 3; the sign-decode step is needed for any k whenever negatives are allowed.)
- After **Number of 1 Bits**: "Popcount for every number 0..n?" (DP: `count[i] = count[i >> 1] + (i & 1)` — O(n) total.)
- After **Bitwise AND of Numbers Range**: "OR of a range instead?" (common prefix again, but the differing suffix becomes all *ones*: prefix + `(1 << shift) - 1`.)
- General Python: "Why doesn't `reverse_bits` need a sign decode but `Single Number II` does?" (Reverse Bits' output is defined as unsigned — the masked bit pattern *is* the answer. Single Number II's output is a signed int that might be negative — the mask only gives you the bit pattern; you still have to interpret it.)

## The task

Four bit problems. No hash maps, no sorting, no shortcuts through `int(s, 2)` for the string problem — each has a stated bit-level technique and complexity bar.

### `add_binary(a, b)`

`a` and `b` are binary strings (`'0'`/`'1'` only, no leading zeros except `"0"` itself). Return their sum as a binary string, same format. Add the strings column by column with a carry — the manual technique, not `int(a, 2) + int(b, 2)`. O(max(m, n)) time.

```python
add_binary("11", "1")       # "100"
add_binary("1010", "1011")  # "10101"
add_binary("0", "0")        # "0"
add_binary("1" * 100, "1")  # "1" + "0" * 100
```

Edge cases: `"0" + "0"` (return `"0"`, not `"00"`), very different lengths, a final carry creating an extra digit, 100+ digit inputs.

### `hamming_weight(n)`

Return the number of set bits in the 32-bit representation of `n`, where `0 <= n <= 2**32 - 1`. Use `n & (n - 1)` to clear the lowest set bit each iteration (or shift-and-mask with `n & 1` / `n >>= 1`), looping until `n == 0`.

```python
hamming_weight(11)          # 3   (0b1011)
hamming_weight(128)         # 1   (0b10000000)
hamming_weight(0)           # 0
hamming_weight(4294967293)  # 31  (all bits except bit 1)
hamming_weight(2147483648)  # 1   (only bit 31)
```

Edge cases: 0, exactly one bit set (including bit 31 alone), all 32 bits set (4294967295 → 32).

### `single_number(nums)`

Every element of `nums` appears exactly twice, except one element that appears exactly once. Return that element in O(n) time and **O(1) extra space** — no dict/set tally. XOR the list: pairs cancel, the singleton survives.

```python
single_number([2, 2, 1])        # 1
single_number([4, 1, 2, 1, 2])  # 4
single_number([1])              # 1
single_number([-3, 7, -3])      # 7
```

Edge cases: single-element list, negative values, the singleton at the start, middle, or end.

### `range_bitwise_and(left, right)`

Return the bitwise AND of all integers in the inclusive range `[left, right]`, with `0 <= left <= right <= 2**31 - 1`. The range may contain billions of numbers, so looping over it is out — the answer is the common binary prefix of `left` and `right` with zeros below it: shift both right until they're equal, then shift back.

```python
range_bitwise_and(5, 7)          # 4
range_bitwise_and(0, 0)          # 0
range_bitwise_and(6, 6)          # 6   (left == right → the number itself)
range_bitwise_and(1, 2147483647) # 0
range_bitwise_and(1500000000, 2000000000)  # 1073741824  (only shared bit 30 survives)
```

Edge cases: `left == right`, `left = 0` (always 0), a range crossing a power of two (result 0), the full `[1, 2**31 - 1]` range, large near-equal endpoints.
