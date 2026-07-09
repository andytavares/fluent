# Hash Maps and Sets

## What you'll learn

The hash-map patterns that turn O(n²) scans into single passes: frequency counting, canonical keys for grouping, value→index lookup, set membership for O(1) "have I seen this?" checks, and cycle detection with a seen-set. After this concept you'll reach for a `Map` or `Set` reflexively whenever a problem says "find a pair", "group these", or "does X appear".

## Key concepts

### Frequency counting

Count occurrences in one pass, then answer questions about the counts. This is the backbone of Ransom Note, Valid Anagram, and half the string problems you'll ever see:

```ts
const counts = new Map<string, number>();
for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1);
```

The increment-or-initialize idiom `(counts.get(c) ?? 0) + 1` is worth memorizing. For a comparison ("does `t` use exactly the letters of `s`?"), count up over one string and count *down* over the other — a count that would go below zero means mismatch.

### `Map`/`Set` vs plain objects

Use `Map` and `Set`, not `{}` or `Record<string, T>`:

| | `Map` / `Set` | plain object |
|---|---|---|
| Key types | anything, no coercion | strings/symbols only (`obj[1]` and `obj["1"]` collide) |
| Size | `.size`, O(1) | `Object.keys(obj).length`, O(n) |
| Prototype pollution | none | `"constructor" in obj` is `true` before you ever set it |
| Membership | `.has(k)` | `k in obj` also finds inherited keys |

The prototype row is a real interview bug: a plain-object frequency table keyed by arbitrary input strings breaks on `"constructor"` or `"toString"`. TypeScript's `Record<string, number>` type won't warn you about this — it's a structural type, not a runtime guarantee.

### Canonical keys — grouping by signature

To group items that are "the same" under some equivalence (anagrams, isomorphic shapes), compute a **canonical form** and use it as the map key. For anagrams, the sorted string:

```ts
const key = [...s].sort().join(""); // "eat", "tea", "ate" → all "aet"
const groups = new Map<string, string[]>();
if (!groups.has(key)) groups.set(key, []);
groups.get(key)!.push(s);
```

Anything with the same signature lands in the same bucket. A 26-slot count array joined into a string (`"1#0#2#..."`) is the O(k) alternative when sorting each string is too slow.

### Value → index maps and the complement trick

Two Sum in one pass: for each element, ask the map whether its **complement** (`target - x`) has already been seen. Check *before* you insert the current element — that's what prevents pairing an element with itself:

```ts
const seen = new Map<number, number>(); // value → index
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen.has(complement)) return [seen.get(complement)!, i];
  seen.set(nums[i], i);
}
```

### Set membership — only do expensive work at sequence starts

Longest Consecutive Sequence looks like it needs sorting, but a `Set` gives O(1) membership, and one guard makes the scan linear: only start counting from numbers that **begin** a run (no `n - 1` in the set). Every element is then visited at most twice — once by the outer loop, once inside some run walk:

```ts
const set = new Set(nums);
for (const n of set) {
  if (set.has(n - 1)) continue;      // not a run start — skip
  let len = 1;
  while (set.has(n + len)) len++;    // walk the run once
}
```

Without the guard the same run gets re-walked from every one of its members — O(n²) on a single long run.

### Seen-sets for cycle detection

When a process iterates a deterministic step (`n → f(n)`) over a bounded state space, it must eventually repeat. Record every visited state in a `Set`; revisiting one means you're in a loop and will never make progress (Happy Number). The O(1)-space alternative is Floyd's tortoise-and-hare, which you'll meet again in linked lists.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Valid Anagram | O(n) | O(k) alphabet | count up / count down |
| Group Anagrams | O(n · k log k) | O(n · k) | canonical (sorted) key |
| Two Sum | O(n) | O(n) | value → index + complement |
| Longest Consecutive Sequence | O(n) | O(n) | set + run-start guard |

## Watch out

- **Check the complement before inserting** in Two Sum, or `target = 2 × nums[i]` will happily return `[i, i]`.
- **`Map` keys don't coerce**: `map.set(1, ...)` then `map.get("1")` is `undefined`. Decide up front whether your keys are numbers or strings — TypeScript's `Map<number, V>` will reject a string key at compile time, which is a real advantage here.
- **The run-start guard is the whole algorithm** in Longest Consecutive Sequence — skipping it still passes small tests but goes quadratic on one long run.
- **`[...s].sort().join("")`, not `s.sort()`** — strings are immutable; spread into an array first. (Single characters sort fine without a comparator.)
- **Length check first** in anagram problems: different lengths can never be anagrams, and with equal lengths a "never goes negative" check during count-down is sufficient — no leftover pass needed.
- **Word Pattern / Isomorphic Strings need the mapping in both directions.** One map catches `"abba"` vs `"dog dog dog dog"` in only one direction; the reverse map catches the other.
- **Duplicates in the input** (Two Sum's `[3, 3]`, Longest Consecutive's repeated values): the map/set handles them naturally — as long as you don't pre-dedupe indexes away.
- **`Map.get` returns `V | undefined`.** Non-null assertions (`groups.get(key)!`) are fine only immediately after a `.has()` check or a `.set()` you just performed — anywhere else, handle `undefined` explicitly.

## Problem walkthroughs

### Ransom Note

**Problem.** Given strings `ransomNote` and `magazine`, return `true` if the note can be assembled from the magazine's letters, each magazine letter usable at most once.

**Example.**

    ransomNote = "aa", magazine = "ab"  → false
    ransomNote = "aa", magazine = "aab" → true

**Steps.**
1. Early exit: if `ransomNote.length > magazine.length`, it's impossible before counting anything.
2. Count every character of `magazine` into a map.
3. Walk `ransomNote`; for each character, look up its count. If it's missing or zero, return `false`; otherwise decrement.
4. Return `true` after the walk — every note letter found an unused magazine letter.

**Complexity.** O(m + n) time / O(k) space for the alphabet actually used.

### Isomorphic Strings

**Problem.** Two equal-length strings `s` and `t` are isomorphic if replacing characters of `s` can produce `t`, where every occurrence of a character maps to the same character and no two characters map to the same one. Return `true` if they are.

**Example.**

    s = "egg",   t = "add"  → true   (e→a, g→d)
    s = "foo",   t = "bar"  → false  (o would map to both a and r)
    s = "badc",  t = "baba" → false  (d and b can't both map to b... a and c can't both map to a)

**Steps.**
1. Keep two maps: `sToT` and `tToS`.
2. Walk both strings in lockstep. For each pair `(a, b)`:
3. If `sToT` has `a` mapped to something other than `b`, or `tToS` has `b` mapped to something other than `a`, return `false`.
4. Otherwise record `sToT.set(a, b)` and `tToS.set(b, a)`.
5. The two maps enforce a bijection — one map alone misses two source characters colliding on the same target.

**Complexity.** O(n) time / O(k) space.

### Word Pattern

**Problem.** Given `pattern` (letters) and `s` (space-separated words), return `true` if the words follow the pattern: a bijection between pattern letters and words.

**Example.**

    pattern = "abba", s = "dog cat cat dog"  → true
    pattern = "abba", s = "dog cat cat fish" → false
    pattern = "abba", s = "dog dog dog dog"  → false

**Steps.**
1. `const words = s.split(" ")`. If `words.length !== pattern.length`, return `false` immediately.
2. Same double-map dance as Isomorphic Strings, but letter ↔ word: `letterToWord` and `wordToLetter`.
3. On each `(letter, word)` pair, reject any conflict with an existing entry in either map; otherwise record both directions.
4. This *is* Isomorphic Strings with words as the second alphabet — recognizing the reduction is the interview win.

**Complexity.** O(n) time / O(n) space for the word map.

### Valid Anagram ★

**Problem.** Return `true` if `t` is an anagram of `s` — the exact same characters with the exact same multiplicities, rearranged.

**Example.**

    s = "anagram", t = "nagaram" → true
    s = "rat",     t = "car"     → false

**Steps.**
1. If lengths differ, return `false` — this also makes step 3's single-direction check sufficient.
2. Count up over `s`: `counts.set(c, (counts.get(c) ?? 0) + 1)`.
3. Count down over `t`: if `counts.get(c)` is missing or zero, return `false`; else decrement.
4. Return `true`. Equal lengths plus "never goes negative" together imply every count ends exactly at zero — no leftover-check pass needed.

**Complexity.** O(n) time / O(k) space — beats sort-both-and-compare's O(n log n).

### Group Anagrams ★

**Problem.** Given an array of strings, group the anagrams together. Return an array of groups; group order and order within a group don't matter.

**Example.**

    ["eat","tea","tan","ate","nat","bat"]
    → [["eat","tea","ate"], ["tan","nat"], ["bat"]]

**Steps.**
1. Create a `Map<string, string[]>`.
2. For each string, compute its canonical key: `[...str].sort().join("")`. Anagrams — and only anagrams — produce identical keys.
3. Append the string to the bucket at that key (creating the bucket on first sight).
4. Return `[...groups.values()]`.
5. Follow-up key: a 26-count signature (`counts.join("#")`) drops the per-string cost from O(k log k) to O(k) for lowercase input.

**Complexity.** O(n · k log k) time (n strings of length ≤ k) / O(n · k) space.

### Two Sum ★

**Problem.** Given `nums` and `target`, return the **indexes** of the two distinct positions whose values sum to `target`. Exactly one answer exists. Unlike Two Sum II from the two-pointers concept, the array is *unsorted* — and sorting would destroy the indexes you need to return.

**Example.**

    nums = [2,7,11,15], target = 9 → [0,1]
    nums = [3,3],       target = 6 → [0,1]

**Steps.**
1. Create `seen: Map<number, number>` from value to index.
2. For each index `i`: compute `complement = target - nums[i]`.
3. If `seen.has(complement)`, return `[seen.get(complement)!, i]` — the stored index is always the smaller one.
4. Otherwise `seen.set(nums[i], i)` and continue.
5. Checking before inserting is what makes `[3, 3]` with target 6 work (the second 3 finds the first) while a lone 3 can't match itself.

**Complexity.** O(n) time / O(n) space — the map buys back the ordering information two pointers got from sortedness.

### Happy Number

**Problem.** Repeatedly replace a positive integer `n` with the sum of the squares of its digits. `n` is *happy* if this process reaches 1. Return `true` if it does; unhappy numbers loop forever without hitting 1.

**Example.**

    19 → 1² + 9² = 82 → 68 → 100 → 1   → true
    2  → 4 → 16 → 37 → ... → 4 (cycle) → false

**Steps.**
1. Write the step function `sumOfSquaredDigits(n)`: peel digits with `n % 10` and `Math.floor(n / 10)`, accumulate `digit * digit`.
2. Keep a `Set` of every value seen. Loop: if `n === 1`, return `true`; if the set already has `n`, you're cycling — return `false`.
3. Otherwise add `n` to the set and step.
4. Termination is guaranteed: a number with `d` digits maps to at most `81d`, so large values shrink and the reachable state space is finite — the process must repeat or reach 1.
5. O(1)-space alternative: Floyd's cycle detection — slow pointer steps once, fast twice; meeting anywhere other than 1 means a cycle.

**Complexity.** O(log n) per step for digit peeling, bounded total steps / O(1) with Floyd, small-bounded with the set.

### Contains Duplicate II

**Problem.** Given `nums` and an integer `k`, return `true` if there are two indexes `i ≠ j` with `nums[i] === nums[j]` and `|i - j| <= k`.

**Example.**

    nums = [1,2,3,1],     k = 3 → true
    nums = [1,2,3,1,2,3], k = 2 → false

**Steps.**
1. Keep `lastIndex: Map<number, number>` from value to its most recent index.
2. For each `i`: if the map has `nums[i]` and `i - lastIndex.get(nums[i]) <= k`, return `true`.
3. Either way, update `lastIndex.set(nums[i], i)` — only the *most recent* previous occurrence can be within `k` of a future index, so overwriting loses nothing.
4. Alternative framing: a sliding-window `Set` of the last `k` elements (add `nums[i]`, evict `nums[i - k]`) — same time, memory bounded by `k`.

**Complexity.** O(n) time / O(min(n, k)) space with the window set, O(n) with the map.

### Longest Consecutive Sequence ★

**Problem.** Given an unsorted array, return the length of the longest run of consecutive integers (values, not positions). Required: O(n) time — so no sorting.

**Example.**

    [100,4,200,1,3,2] → 4   (the run 1,2,3,4)
    []                → 0

**Steps.**
1. Pour everything into a `Set` — deduplicates and gives O(1) membership.
2. For each value `n` in the set, check `set.has(n - 1)`. If present, `n` is mid-run: **skip it**.
3. If `n` starts a run, walk upward — `while (set.has(n + len)) len++` — and fold `len` into the best.
4. The guard is the linearity proof: each run is walked exactly once, from its unique start, so total inner-loop work across all starts is O(n).

**Complexity.** O(n) time / O(n) space — sorting would be O(n log n) and is explicitly off the table.

## Interview follow-ups

- After **Two Sum**: "The array is sorted — can you beat O(n) space?" (converging pointers, O(1) space — that's Two Sum II from the previous concept.) "Return *all* pairs, no duplicates?" (sort + two pointers with duplicate skipping.)
- After **Group Anagrams**: "Strings are millions of characters?" (26-count signature key — O(k) per string instead of O(k log k).)
- After **Valid Anagram**: "Unicode input?" (a `Map` already handles it; a fixed 26-slot array does not — say so out loud.)
- After **Happy Number**: "O(1) space?" (Floyd's tortoise and hare on the step function.)
- After **Longest Consecutive Sequence**: "Why is this O(n) with a nested while loop?" (amortization: every element is visited at most twice — the run-start guard prevents re-walks.)

## The task

Four hash-map classics. Each must run in the stated time; `Map`/`Set` operations count as O(1).

### `isAnagram(s: string, t: string): boolean`

Return `true` if `t` is an anagram of `s`: both strings contain exactly the same characters with the same multiplicities, just possibly reordered. Comparison is case-sensitive and every character counts (no filtering). O(n) time — don't sort.

```ts
isAnagram("anagram", "nagaram"); // true
isAnagram("rat", "car");         // false
isAnagram("ab", "a");            // false (different lengths)
isAnagram("", "");               // true
```

Edge cases: strings of different lengths (always `false`), empty strings (`true`), same character set with different multiplicities (`"aacc"` vs `"ccac"` → `false`).

### `groupAnagrams(strs: string[]): string[][]`

Given an array of strings, return an array of arrays where each inner array holds all strings from `strs` that are anagrams of each other. Every input string appears in exactly one group. The order of the groups and the order of strings within a group don't matter. Duplicate strings are distinct entries and all land in the same group.

```ts
groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
// [["eat","tea","ate"], ["tan","nat"], ["bat"]]  (any order)

groupAnagrams([""]);   // [[""]]
groupAnagrams(["a"]);  // [["a"]]
```

Edge cases: empty input array (`[]`), single string, empty strings grouping together, duplicate strings (`["ab", "ba", "ab"]` → one group of three), strings with no anagram partner (singleton groups).

### `twoSum(nums: number[], target: number): number[]`

Given an unsorted array `nums` and an integer `target`, return the **0-based indexes** `[i, j]` with `i < j` of the two distinct positions whose values sum exactly to `target`. Exactly one solution exists for every input you'll receive; the same position may not be used twice (two equal *values* at different positions are fine). O(n) time — one pass with a map; sorting would lose the indexes.

```ts
twoSum([2, 7, 11, 15], 9); // [0, 1]
twoSum([3, 2, 4], 6);      // [1, 2]
twoSum([3, 3], 6);         // [0, 1]
```

Edge cases: duplicate values forming the pair, negative numbers, `target` of 0, the pair sitting at the two ends of the array.

### `longestConsecutive(nums: number[]): number`

Return the length of the longest run of consecutive integer *values* present in `nums` (positions don't matter). The array is unsorted and may contain duplicates. Must run in O(n) time — sorting is not allowed; use a `Set` and only count upward from values that start a run.

```ts
longestConsecutive([100, 4, 200, 1, 3, 2]);         // 4  (1,2,3,4)
longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]); // 9  (0..8)
longestConsecutive([]);                              // 0
```

Edge cases: empty array (`0`), single element (`1`), duplicates inside a run (they don't lengthen it), negative values, runs crossing zero (`[-2, -1, 0, 1]` → 4), no consecutive values at all (`[10, 20, 30]` → 1).
