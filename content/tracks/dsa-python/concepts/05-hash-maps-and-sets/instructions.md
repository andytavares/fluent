## What you build

You write four hash-map functions: `is_anagram`, `group_anagrams`, `two_sum` and `longest_consecutive`. Hash maps and sets turn O(n²) scans into one pass. Use a `dict` or `set` when a problem says "find a pair", "group these" or "does X appear". This lesson builds on **Matrix**.

## Key concepts

### Frequency counting answers questions about counts

Count occurrences in one pass, then answer questions about the counts. Ransom Note, Valid Anagram and many string problems rest on this.

```python
counts: dict[str, int] = {}
for c in s:
    counts[c] = counts.get(c, 0) + 1
```

Learn the increment-or-start idiom `counts.get(c, 0) + 1`. To compare two strings, count up over one and count down over the other. A count that goes below zero means a mismatch.

### `Counter` and `defaultdict` remove the missing-key branch

A plain `dict` works for every table. The `collections` module adds two variants that handle a missing key for you:

| | `dict` | `Counter` | `defaultdict(list)` |
|---|---|---|---|
| Use for | general key to value | frequency tables | grouping into buckets |
| Missing key | `KeyError` (or `.get(k, default)`) | returns `0` | creates the default |
| Increment | `.get(k, 0) + 1` | `counts[c] += 1` | — |

`defaultdict(list)` removes the "does this bucket exist yet?" branch from grouping code.

### A canonical key groups equivalent items

To group items that are "the same" under some equivalence, compute a canonical form and use it as the map key. Anagrams and isomorphic shapes work this way. For anagrams, the key is the sorted string.

```python
# groups: key -> words; s: one word
# "eat", "tea", "ate" -> all "aet"
key = "".join(sorted(s))
groups.setdefault(key, []).append(s)
```

Items with the same signature land in the same bucket. A 26-slot count tuple (`tuple(counts)`) is the O(k) key when a sort of each string is too slow.

### A value-to-index map finds the complement

Two Sum takes one pass. For each element, ask the map whether its complement (`target - x`) appeared already. Check before you insert the current element, so an element never pairs with itself.

```python
# value -> index
seen: dict[int, int] = {}
for i, x in enumerate(nums):
    complement = target - x
    if complement in seen:
        return [seen[complement], i]
    seen[x] = i
```

### Set membership: start work only at a run's start

Longest Consecutive Sequence looks like it needs a sort. A `set` gives O(1) membership, and one guard makes the scan linear. Start a count only from a number that begins a run, with no `n - 1` in the set. The scan then visits each element at most twice: once in the outer loop and once inside one run walk.

```python
values = set(nums)
for n in values:
    # Not a run start: skip.
    if n - 1 in values:
        continue
    length = 1
    # Walk the run once.
    while n + length in values:
        length += 1
```

Without the guard, every member of a run walks it again. One long run then costs O(n²).

### A seen-set detects a cycle

A process that repeats a deterministic step (`n -> f(n)`) over a bounded state space must repeat a state. Record every state in a `set`. A repeat means a loop that never makes progress (Happy Number). The O(1)-space alternative is Floyd's tortoise and hare, which the linked list concept uses again.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Valid Anagram | O(n) | O(k) alphabet | count up / count down |
| Group Anagrams | O(n · k log k) | O(n · k) | canonical (sorted) key |
| Two Sum | O(n) | O(n) | value → index + complement |
| Longest Consecutive Sequence | O(n) | O(n) | set + run-start guard |

## Watch out

- In Two Sum, check the complement before you insert. Otherwise `target = 2 × nums[i]` returns `[i, i]`.
- `dict` keys compare with `==` and `hash()`. `1`, `1.0` and `True` are the same key, so `{1: "a"}[1.0]` returns `"a"`.
- The run-start guard is the whole algorithm in Longest Consecutive Sequence. Without it, small tests pass but one long run goes quadratic.
- Write `"".join(sorted(s))`, not `s.sort()`. Strings are immutable, and `sorted()` returns a new list of characters.
- In anagram problems, check the lengths first. Different lengths are never anagrams.
- With equal lengths, a "never goes negative" check in the count-down is enough. No leftover pass is necessary.
- Word Pattern and Isomorphic Strings need the mapping in both directions. One map catches only one direction of a conflict.
- Duplicates such as Two Sum's `[3, 3]` need no special handling. Do not dedupe the input first.

## Problem walkthroughs

### Ransom Note

**Problem.** Given strings `ransom_note` and `magazine`, return `True` if you can build the note from the magazine's letters. You can use each magazine letter at most once.

**Example.**

```text
"aa", "ab"  -> False
"aa", "aab" -> True
```

**Steps.**
1. Exit early if `len(ransom_note) > len(magazine)`. The note cannot fit.
2. Count every character of `magazine` into a map.
3. Walk `ransom_note`. For each character, look up its count. If it is missing or zero, return `False`. Otherwise decrement it.
4. Return `True` after the walk. Every note letter found an unused magazine letter.

**Complexity.** O(m + n) time / O(k) space for the letters in use.

### Isomorphic Strings

**Problem.** Two strings `s` and `t` of equal length are isomorphic if a character replacement turns `s` into `t`. Every occurrence of a character maps to the same character, and no two characters map to the same one. Return `True` if they are isomorphic.

**Example.**

```text
"egg", "add"   -> True  (e->a, g->d)
"foo", "bar"   -> False
(o maps to both a and r)
"badc", "baba" -> False
(b and d both map to b)
```

**Steps.**
1. Keep two maps: `s_to_t` and `t_to_s`.
2. Walk both strings together with `zip(s, t)`. Take each pair `(a, b)`.
3. If `s_to_t` maps `a` to a value other than `b`, return `False`. If `t_to_s` maps `b` to a value other than `a`, return `False`.
4. Otherwise record `s_to_t[a] = b` and `t_to_s[b] = a`.
5. The two maps enforce a bijection. One map alone misses two source characters on the same target.

**Complexity.** O(n) time / O(k) space.

### Word Pattern

**Problem.** Given `pattern` (letters) and `s` (words separated by spaces), return `True` if the words follow the pattern. The pattern letters and the words must form a bijection.

**Example.**

```text
"abba", "dog cat cat dog"  -> True
"abba", "dog cat cat fish" -> False
"abba", "dog dog dog dog"  -> False
```

**Steps.**
1. Set `words = s.split(" ")`. If `len(words) != len(pattern)`, return `False`.
2. Use the two-map method from Isomorphic Strings, with letters and words: `letter_to_word` and `word_to_letter`.
3. For each `(letter, word)` pair, reject a conflict with an entry in either map. Otherwise record both directions.
4. This is Isomorphic Strings with words as the second alphabet. Spot that reduction in the interview.

**Complexity.** O(n) time / O(n) space for the word map.

### Valid Anagram ★

**Problem.** Return `True` if `t` is an anagram of `s`: the same characters with the same counts, in another order.

**Example.**

```text
"anagram", "nagaram" -> True
"rat", "car" -> False
```

**Steps.**
1. If the lengths differ, return `False`. This also makes the one-direction check in step 3 enough.
2. Count up over `s`: `counts[c] = counts.get(c, 0) + 1`.
3. Count down over `t`. If `counts.get(c, 0)` is zero, return `False`. Otherwise decrement it.
4. Return `True`. Equal lengths and "never goes negative" mean every count ends at zero. No leftover check is necessary.

**Complexity.** O(n) time / O(k) space. This beats a sort of both strings, which costs O(n log n).

### Group Anagrams ★

**Problem.** Given a list of strings, group the anagrams together. Return a list of groups. The order of groups and the order inside a group do not matter.

**Example.**

```text
["eat","tea","tan","ate","nat","bat"]
-> [["eat","tea","ate"],
    ["tan","nat"], ["bat"]]
```

**Steps.**
1. Create a `dict[str, list[str]]`, or a `defaultdict(list)`.
2. For each string, compute its canonical key: `"".join(sorted(s))`. Anagrams, and only anagrams, give the same key.
3. Append the string to the bucket at that key. Create the bucket on first sight.
4. Return `list(groups.values())`.
5. For lowercase input, a 26-count key (`tuple(counts)`) drops the cost per string from O(k log k) to O(k).

**Complexity.** O(n · k log k) time for n strings of length up to k / O(n · k) space.

### Two Sum ★

**Problem.** Given `nums` and `target`, return the indexes of the two distinct positions whose values sum to `target`. Exactly one answer exists. Unlike Two Sum II in **Two Pointers**, the list is not in order. A sort destroys the indexes you must return.

**Example.**

```text
[2,7,11,15], target 9 -> [0,1]
[3,3], target 6 -> [0,1]
```

**Steps.**
1. Create `seen: dict[int, int]`, from value to index.
2. For each index `i`, compute `complement = target - nums[i]`.
3. If `complement in seen`, return `[seen[complement], i]`. The stored index is always the smaller one.
4. Otherwise set `seen[nums[i]] = i` and continue.
5. The check before the insert makes `[3, 3]` with target 6 work: the second 3 finds the first. A single 3 cannot match itself.

**Complexity.** O(n) time / O(n) space. The map buys back the order information that two pointers got from a sorted list.

### Happy Number

**Problem.** Replace a positive integer `n` with the sum of the squares of its digits, again and again. `n` is happy if this process reaches 1. Return `True` if it does. An unhappy number loops forever without 1.

**Example.**

```text
19 -> 1² + 9² = 82 -> 68 -> 100 -> 1
  -> True
2 -> 4 -> 16 -> 37 -> ... -> 4
  (cycle) -> False
```

**Steps.**
1. Write the step function `sum_of_squared_digits(n)`. Take digits with `n % 10` and `n // 10`, and add up `digit * digit`.
2. Keep a `set` of every value you see. In the loop, if `n == 1`, return `True`. If the set already has `n`, you are in a cycle, so return `False`.
3. Otherwise add `n` to the set and take a step.
4. The loop always ends. A number with `d` digits maps to at most `81d`, so large values shrink. The reachable states are finite, so the process repeats or reaches 1.
5. The O(1)-space alternative is Floyd's cycle detection. The slow pointer takes one step and the fast pointer takes two. A meeting anywhere other than 1 means a cycle.

**Complexity.** O(log n) per step to read the digits, with a bounded number of steps / O(1) space with Floyd, a small bounded set otherwise.

### Contains Duplicate II

**Problem.** Given `nums` and an integer `k`, return `True` if two indexes `i ≠ j` have `nums[i] == nums[j]` and `|i - j| <= k`.

**Example.**

```text
[1,2,3,1], k = 3 -> True
[1,2,3,1,2,3], k = 2 -> False
```

**Steps.**
1. Keep `last_index: dict[int, int]`, from each value to its latest index.
2. For each `i`, if `nums[i] in last_index` and `i - last_index[nums[i]] <= k`, return `True`.
3. In both cases, set `last_index[nums[i]] = i`. Only the latest earlier occurrence can be within `k` of a future index, so the overwrite loses nothing.
4. Another view is a sliding-window `set` of the last `k` elements. Add `nums[i]` and evict `nums[i - k]`. The time is the same, and memory stays within `k`.

**Complexity.** O(n) time / O(min(n, k)) space with the window set, O(n) with the map.

### Longest Consecutive Sequence ★

**Problem.** Given a list in no order, return the length of the longest run of consecutive integers. Runs are by value, not by position. The time must be O(n), so you cannot sort.

**Example.**

```text
[100,4,200,1,3,2] -> 4
(the run 1,2,3,4)
[] -> 0
```

**Steps.**
1. Put every value into a `set`. The set removes duplicates and gives O(1) membership.
2. For each value `n` in the set, check `n - 1 in values`. If it is present, `n` is inside a run, so skip it.
3. If `n` starts a run, walk upward with `while n + length in values: length += 1`. Fold `length` into the best.
4. The guard proves linearity. You walk each run once, from its unique start, so the total inner-loop work is O(n).

**Complexity.** O(n) time / O(n) space. A sort costs O(n log n), and the problem forbids it.

## Interview follow-ups

- After **Two Sum**: "The list is in order. Can you beat O(n) space?" Use converging pointers with O(1) space, as in Two Sum II. "Return all pairs, no duplicates?" Sort, then use two pointers with duplicate skips.
- After **Group Anagrams**: "What if strings have millions of characters?" Use a 26-count key: O(k) per string instead of O(k log k).
- After **Valid Anagram**: "Unicode input?" A `dict` already handles it. A fixed 26-slot list does not, so say so out loud.
- After **Happy Number**: "O(1) space?" Use Floyd's tortoise and hare on the step function.
- After **Longest Consecutive Sequence**: "Why is this O(n) with a nested while loop?" Amortization: you visit each element at most twice, because the run-start guard prevents repeat walks.

## The task

You write four hash-map functions. Each runs in the stated time. `dict` and `set` operations count as O(1).

1. `is_anagram(s: str, t: str) -> bool` returns `True` if `t` is an anagram of `s`. Both strings hold the same characters with the same counts.
2. The comparison is case-sensitive, and every character counts. Use O(n) time. Do not sort.
3. `group_anagrams(strs: list[str]) -> list[list[str]]` returns a list of lists. Each inner list holds all strings from `strs` that are anagrams of each other.
4. Every input string appears in exactly one group. The order of groups, and of strings inside a group, does not matter.
5. Duplicate strings are separate entries, and they all land in the same group.
6. `two_sum(nums: list[int], target: int) -> list[int]` takes an unordered list `nums` and an integer `target`.
7. It returns the 0-based indexes `[i, j]`, with `i < j`, of two distinct positions that sum to `target`.
8. Exactly one solution exists. You cannot use the same position twice. Two equal values at different positions are fine.
9. Use one pass with a map, in O(n) time. A sort loses the indexes.
10. `longest_consecutive(nums: list[int]) -> int` returns the length of the longest run of consecutive integer values in `nums`. Positions do not matter.
11. The list is in no order and can hold duplicates. Use O(n) time with a `set`. Do not sort.

Edge cases:

- `is_anagram`: strings of different lengths are always `False`. Two empty strings are `True`.
- `is_anagram`: the same character set with different counts is `False`, for example `"aacc"` and `"ccac"`.
- `group_anagrams`: an empty input list returns `[]`. Handle a single string and empty strings, which group together.
- `group_anagrams`: duplicate strings join one group. A string with no anagram partner forms its own group.
- `two_sum`: handle duplicate values in the pair, negative numbers, a `target` of 0 and a pair at the two ends.
- `longest_consecutive`: an empty list returns `0`, and a single element returns `1`. Duplicates inside a run do not lengthen it.
- `longest_consecutive`: handle negative values and runs that cross zero. With no consecutive values, the answer is `1`.

```python
is_anagram("anagram", "nagaram")  # True
is_anagram("rat", "car")          # False
is_anagram("ab", "a")             # False
is_anagram("", "")                # True
is_anagram("aacc", "ccac")        # False

group_anagrams(["eat", "tea", "tan",
                "ate", "nat", "bat"])
# [["eat","tea","ate"],
#  ["tan","nat"], ["bat"]] (any order)
group_anagrams([])       # []
group_anagrams([""])     # [[""]]
group_anagrams(["a"])    # [["a"]]
group_anagrams(["ab", "ba", "ab"])
# [["ab", "ba", "ab"]] (any order)

two_sum([2, 7, 11, 15], 9)  # [0, 1]
two_sum([3, 2, 4], 6)       # [1, 2]
two_sum([3, 3], 6)          # [0, 1]
two_sum([5, -7, 2, 7], 0)   # [1, 3]

longest_consecutive(
    [100, 4, 200, 1, 3, 2])  # 4
longest_consecutive([])            # 0
longest_consecutive([10, 20, 30])  # 1
longest_consecutive([-2, 1, -1, 0])
# 4
longest_consecutive([1, 2, 2, 3])  # 3
```
