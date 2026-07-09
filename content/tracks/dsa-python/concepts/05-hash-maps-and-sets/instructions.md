# Hash Maps

## What you'll learn

The hash-map patterns that turn O(n²) scans into single passes: frequency counting, canonical keys for grouping, value→index lookup, set membership for O(1) "have I seen this?" checks, and cycle detection with a seen-set. After this concept you'll reach for a `dict` or `set` reflexively whenever a problem says "find a pair", "group these", or "does X appear".

## Key concepts

### Frequency counting

Count occurrences in one pass, then answer questions about the counts. This is the backbone of Ransom Note, Valid Anagram, and half the string problems you'll ever see:

```python
counts: dict[str, int] = {}
for c in s:
    counts[c] = counts.get(c, 0) + 1
```

The increment-or-initialize idiom `counts.get(c, 0) + 1` is worth memorizing — or reach for `collections.Counter(s)`, which does exactly this in one call. For a comparison ("does `t` use exactly the letters of `s`?"), count up over one string and count *down* over the other — a count that would go below zero means mismatch.

### `dict`/`set` vs `Counter`/`defaultdict`

Python doesn't have the object-vs-map footgun JavaScript has (a `dict` never collides with inherited attributes), but pick the right member of the `collections` family:

| | `dict` | `Counter` | `defaultdict(list)` |
|---|---|---|---|
| Use for | general key→value | frequency tables | grouping into buckets |
| Missing key | `KeyError` (or `.get(k, default)`) | returns `0` | auto-creates the default |
| Arithmetic | manual `.get(k, 0) + 1` | `counts[c] += 1` just works | — |

`defaultdict(list)` removes the "does this bucket exist yet?" branch from grouping code entirely — that's the one habit worth building here.

### Canonical keys — grouping by signature

To group items that are "the same" under some equivalence (anagrams, isomorphic shapes), compute a **canonical form** and use it as the dict key. For anagrams, the sorted string:

```python
groups: dict[str, list[str]] = {}
key = "".join(sorted(s))  # "eat", "tea", "ate" -> all "aet"
groups.setdefault(key, []).append(s)
```

Anything with the same signature lands in the same bucket. A 26-slot count tuple (`tuple(counts)`) is the O(k) alternative when sorting each string is too slow.

### Value → index maps and the complement trick

Two Sum in one pass: for each element, ask the dict whether its **complement** (`target - x`) has already been seen. Check *before* you insert the current element — that's what prevents pairing an element with itself:

```python
seen: dict[int, int] = {}  # value -> index
for i, x in enumerate(nums):
    complement = target - x
    if complement in seen:
        return [seen[complement], i]
    seen[x] = i
```

### Set membership — only do expensive work at sequence starts

Longest Consecutive Sequence looks like it needs sorting, but a `set` gives O(1) membership, and one guard makes the scan linear: only start counting from numbers that **begin** a run (no `n - 1` in the set). Every element is then visited at most twice — once by the outer loop, once inside some run walk:

```python
values = set(nums)
for n in values:
    if n - 1 in values:
        continue          # not a run start — skip
    length = 1
    while n + length in values:
        length += 1        # walk the run once
```

Without the guard the same run gets re-walked from every one of its members — O(n²) on a single long run.

### Seen-sets for cycle detection

When a process iterates a deterministic step (`n -> f(n)`) over a bounded state space, it must eventually repeat. Record every visited state in a `set`; revisiting one means you're in a loop and will never make progress (Happy Number). The O(1)-space alternative is Floyd's tortoise-and-hare, which you'll meet again in linked lists.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Valid Anagram | O(n) | O(k) alphabet | count up / count down |
| Group Anagrams | O(n · k log k) | O(n · k) | canonical (sorted) key |
| Two Sum | O(n) | O(n) | value → index + complement |
| Longest Consecutive Sequence | O(n) | O(n) | set + run-start guard |

## Watch out

- **Check the complement before inserting** in Two Sum, or `target = 2 × nums[i]` will happily return `[i, i]`.
- **`dict` keys use `==`/`hash()`**: `1`, `1.0`, and `True` all hash equal in Python, so `{1: "a"}[1.0]` succeeds — usually harmless, but worth knowing before you key a map by mixed numeric types.
- **The run-start guard is the whole algorithm** in Longest Consecutive Sequence — skipping it still passes small tests but goes quadratic on one long run.
- **`"".join(sorted(s))`, not `s.sort()`** — strings are immutable in Python; `sorted()` returns a new list of characters that you rejoin.
- **Length check first** in anagram problems: different lengths can never be anagrams, and with equal lengths a "never goes negative" check during count-down is sufficient — no leftover pass needed.
- **Word Pattern / Isomorphic Strings need the mapping in both directions.** One dict catches `"abba"` vs `"dog dog dog dog"` in only one direction; the reverse dict catches the other.
- **Duplicates in the input** (Two Sum's `[3, 3]`, Longest Consecutive's repeated values): the dict/set handles them naturally — as long as you don't pre-dedupe indexes away.

## Problem walkthroughs

### Ransom Note

**Problem.** Given strings `ransom_note` and `magazine`, return `True` if the note can be assembled from the magazine's letters, each magazine letter usable at most once.

**Example.**

    ransom_note = "aa", magazine = "ab"  → False
    ransom_note = "aa", magazine = "aab" → True

**Steps.**
1. Early exit: if `len(ransom_note) > len(magazine)`, it's impossible before counting anything.
2. Count every character of `magazine` into a `Counter`.
3. Walk `ransom_note`; for each character, look up its count. If it's missing or zero, return `False`; otherwise decrement.
4. Return `True` after the walk — every note letter found an unused magazine letter.

**Complexity.** O(m + n) time / O(k) space for the alphabet actually used.

### Isomorphic Strings

**Problem.** Two equal-length strings `s` and `t` are isomorphic if replacing characters of `s` can produce `t`, where every occurrence of a character maps to the same character and no two characters map to the same one. Return `True` if they are.

**Example.**

    s = "egg",   t = "add"  → True   (e→a, g→d)
    s = "foo",   t = "bar"  → False  (o would map to both a and r)
    s = "badc",  t = "baba" → False  (d and b can't both map to b... a and c can't both map to a)

**Steps.**
1. Keep two dicts: `s_to_t` and `t_to_s`.
2. Walk both strings in lockstep with `zip(s, t)`. For each pair `(a, b)`:
3. If `s_to_t` has `a` mapped to something other than `b`, or `t_to_s` has `b` mapped to something other than `a`, return `False`.
4. Otherwise record `s_to_t[a] = b` and `t_to_s[b] = a`.
5. The two dicts enforce a bijection — one dict alone misses two source characters colliding on the same target.

**Complexity.** O(n) time / O(k) space.

### Word Pattern

**Problem.** Given `pattern` (letters) and `s` (space-separated words), return `True` if the words follow the pattern: a bijection between pattern letters and words.

**Example.**

    pattern = "abba", s = "dog cat cat dog"  → True
    pattern = "abba", s = "dog cat cat fish" → False
    pattern = "abba", s = "dog dog dog dog"  → False

**Steps.**
1. `words = s.split(" ")`. If `len(words) != len(pattern)`, return `False` immediately.
2. Same double-dict dance as Isomorphic Strings, but letter ↔ word: `letter_to_word` and `word_to_letter`.
3. On each `(letter, word)` pair (via `zip`), reject any conflict with an existing entry in either dict; otherwise record both directions.
4. This *is* Isomorphic Strings with words as the second alphabet — recognizing the reduction is the interview win.

**Complexity.** O(n) time / O(n) space for the word map.

### Valid Anagram ★

**Problem.** Return `True` if `t` is an anagram of `s` — the exact same characters with the exact same multiplicities, rearranged.

**Example.**

    s = "anagram", t = "nagaram" → True
    s = "rat",     t = "car"     → False

**Steps.**
1. If lengths differ, return `False` — this also makes step 3's single-direction check sufficient.
2. Count up over `s` with a `Counter` (or manual dict).
3. Count down over `t`: if the count for `c` is missing or zero, return `False`; else decrement.
4. Return `True`. Equal lengths plus "never goes negative" together imply every count ends exactly at zero — no leftover-check pass needed.

**Complexity.** O(n) time / O(k) space — beats sort-both-and-compare's O(n log n).

### Group Anagrams ★

**Problem.** Given a list of strings, group the anagrams together. Return a list of groups; group order and order within a group don't matter.

**Example.**

    ["eat","tea","tan","ate","nat","bat"]
    → [["eat","tea","ate"], ["tan","nat"], ["bat"]]

**Steps.**
1. Create a `defaultdict(list)`.
2. For each string, compute its canonical key: `"".join(sorted(s))`. Anagrams — and only anagrams — produce identical keys.
3. Append the string to the bucket at that key.
4. Return `list(groups.values())`.
5. Follow-up key: a 26-count signature (`tuple(counts)`) drops the per-string cost from O(k log k) to O(k) for lowercase input.

**Complexity.** O(n · k log k) time (n strings of length ≤ k) / O(n · k) space.

### Two Sum ★

**Problem.** Given `nums` and `target`, return the **indexes** of the two distinct positions whose values sum to `target`. Exactly one answer exists. Unlike Two Sum II from the two-pointers concept, the list is *unsorted* — and sorting would destroy the indexes you need to return.

**Example.**

    nums = [2,7,11,15], target = 9 → [0,1]
    nums = [3,3],       target = 6 → [0,1]

**Steps.**
1. Create `seen: dict[int, int]` from value to index.
2. For each index `i`: compute `complement = target - nums[i]`.
3. If `complement in seen`, return `[seen[complement], i]` — the stored index is always the smaller one.
4. Otherwise `seen[nums[i]] = i` and continue.
5. Checking before inserting is what makes `[3, 3]` with target 6 work (the second 3 finds the first) while a lone 3 can't match itself.

**Complexity.** O(n) time / O(n) space — the dict buys back the ordering information two pointers got from sortedness.

### Happy Number

**Problem.** Repeatedly replace a positive integer `n` with the sum of the squares of its digits. `n` is *happy* if this process reaches 1. Return `True` if it does; unhappy numbers loop forever without hitting 1.

**Example.**

    19 → 1² + 9² = 82 → 68 → 100 → 1   → True
    2  → 4 → 16 → 37 → ... → 4 (cycle) → False

**Steps.**
1. Write the step function `sum_of_squared_digits(n)`: peel digits with `n % 10` and `n // 10`, accumulate `digit * digit`.
2. Keep a `set` of every value seen. Loop: if `n == 1`, return `True`; if the set already has `n`, you're cycling — return `False`.
3. Otherwise add `n` to the set and step.
4. Termination is guaranteed: a number with `d` digits maps to at most `81d`, so large values shrink and the reachable state space is finite — the process must repeat or reach 1.
5. O(1)-space alternative: Floyd's cycle detection — slow pointer steps once, fast twice; meeting anywhere other than 1 means a cycle.

**Complexity.** O(log n) per step for digit peeling, bounded total steps / O(1) with Floyd, small-bounded with the set.

### Contains Duplicate II

**Problem.** Given `nums` and an integer `k`, return `True` if there are two indexes `i != j` with `nums[i] == nums[j]` and `abs(i - j) <= k`.

**Example.**

    nums = [1,2,3,1],     k = 3 → True
    nums = [1,2,3,1,2,3], k = 2 → False

**Steps.**
1. Keep `last_index: dict[int, int]` from value to its most recent index.
2. For each `i`: if the dict has `nums[i]` and `i - last_index[nums[i]] <= k`, return `True`.
3. Either way, update `last_index[nums[i]] = i` — only the *most recent* previous occurrence can be within `k` of a future index, so overwriting loses nothing.
4. Alternative framing: a sliding-window `set` of the last `k` elements (add `nums[i]`, evict `nums[i - k]`) — same time, memory bounded by `k`.

**Complexity.** O(n) time / O(min(n, k)) space with the window set, O(n) with the dict.

### Longest Consecutive Sequence ★

**Problem.** Given an unsorted list, return the length of the longest run of consecutive integers (values, not positions). Required: O(n) time — so no sorting.

**Example.**

    [100,4,200,1,3,2] → 4   (the run 1,2,3,4)
    []                → 0

**Steps.**
1. Pour everything into a `set` — deduplicates and gives O(1) membership.
2. For each value `n` in the set, check `n - 1 in values`. If present, `n` is mid-run: **skip it**.
3. If `n` starts a run, walk upward — `while n + length in values: length += 1` — and fold `length` into the best.
4. The guard is the linearity proof: each run is walked exactly once, from its unique start, so total inner-loop work across all starts is O(n).

**Complexity.** O(n) time / O(n) space — sorting would be O(n log n) and is explicitly off the table.

## Interview follow-ups

- After **Two Sum**: "The list is sorted — can you beat O(n) space?" (converging pointers, O(1) space — that's Two Sum II from the previous concept.) "Return *all* pairs, no duplicates?" (sort + two pointers with duplicate skipping.)
- After **Group Anagrams**: "Strings are millions of characters?" (26-count signature key — O(k) per string instead of O(k log k).)
- After **Valid Anagram**: "Unicode input?" (a `dict`/`Counter` already handles it; a fixed 26-slot array does not — say so out loud.)
- After **Happy Number**: "O(1) space?" (Floyd's tortoise and hare on the step function.)
- After **Longest Consecutive Sequence**: "Why is this O(n) with a nested while loop?" (amortization: every element is visited at most twice — the run-start guard prevents re-walks.)

## The task

Four hash-map classics. Each must run in the stated time; `dict`/`set` operations count as O(1).

### `is_anagram(s, t)`

Return `True` if `t` is an anagram of `s`: both strings contain exactly the same characters with the same multiplicities, just possibly reordered. Comparison is case-sensitive and every character counts (no filtering). O(n) time — don't sort.

```python
is_anagram("anagram", "nagaram")  # True
is_anagram("rat", "car")          # False
is_anagram("ab", "a")             # False (different lengths)
is_anagram("", "")                # True
```

Edge cases: strings of different lengths (always `False`), empty strings (`True`), same character set with different multiplicities (`"aacc"` vs `"ccac"` → `False`).

### `group_anagrams(strs)`

Given a list of strings, return a list of lists where each inner list holds all strings from `strs` that are anagrams of each other. Every input string appears in exactly one group. The order of the groups and the order of strings within a group don't matter. Duplicate strings are distinct entries and all land in the same group.

```python
group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
# [["eat","tea","ate"], ["tan","nat"], ["bat"]]  (any order)

group_anagrams([""])   # [[""]]
group_anagrams(["a"])  # [["a"]]
```

Edge cases: empty input list (`[]`), single string, empty strings grouping together, duplicate strings (`["ab", "ba", "ab"]` → one group of three), strings with no anagram partner (singleton groups).

### `two_sum(nums, target)`

Given an unsorted list `nums` and an integer `target`, return the **0-based indexes** `[i, j]` with `i < j` of the two distinct positions whose values sum exactly to `target`. Exactly one solution exists for every input you'll receive; the same position may not be used twice (two equal *values* at different positions are fine). O(n) time — one pass with a dict; sorting would lose the indexes.

```python
two_sum([2, 7, 11, 15], 9)  # [0, 1]
two_sum([3, 2, 4], 6)       # [1, 2]
two_sum([3, 3], 6)          # [0, 1]
```

Edge cases: duplicate values forming the pair, negative numbers, `target` of 0, the pair sitting at the two ends of the list.

### `longest_consecutive(nums)`

Return the length of the longest run of consecutive integer *values* present in `nums` (positions don't matter). The list is unsorted and may contain duplicates. Must run in O(n) time — sorting is not allowed; use a `set` and only count upward from values that start a run.

```python
longest_consecutive([100, 4, 200, 1, 3, 2])          # 4  (1,2,3,4)
longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])   # 9  (0..8)
longest_consecutive([])                               # 0
```

Edge cases: empty list (`0`), single element (`1`), duplicates inside a run (they don't lengthen it), negative values, runs crossing zero (`[-2, -1, 0, 1]` → 4), no consecutive values at all (`[10, 20, 30]` → 1).
