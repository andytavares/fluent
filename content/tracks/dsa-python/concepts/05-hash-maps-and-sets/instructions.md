# Hash Maps and Sets

## What you'll learn

How to trade O(n) space to cut time from O(n²) to O(n), why Python's `dict` and `set` are the right defaults, and how a hash set enables an O(n) solution to a problem that looks like it requires sorting.

## Key concepts

The core pattern: **convert "have I seen this?" from a linear scan into an O(1) lookup** by storing values in a `dict` or `set` as you process them.

### Two Sum — single-pass hash map

```python
def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}       # value -> index
    for i, x in enumerate(nums):
        complement = target - x
        if complement in seen:
            return (seen[complement], i)
        seen[x] = i                 # store after checking — avoids using the same index twice
    return None
```

**Why store after checking?** If `nums = [3,3]` and `target = 6`, the first `3` is checked: complement `3` not yet in `seen`. Then `seen[3] = 0`. Second `3`: complement `3` is in `seen` at index 0, return `(0, 1)`. Storing first would return `(0, 0)`.

### Group Anagrams — canonical key grouping

```python
from collections import defaultdict

def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for word in words:
        key = "".join(sorted(word))   # all anagrams share the same sorted key
        groups[key].append(word)
    return list(groups.values())
```

### Longest Consecutive Sequence — hash set for O(1) membership

The trick: build a `set` of all numbers, then for each number that is a **sequence start** (i.e., `n-1` not in the set), count the run forward. This avoids redundant work.

```python
def longest_consecutive_sequence(nums: list[int]) -> int:
    num_set = set(nums)
    best = 0
    for n in num_set:
        if n - 1 not in num_set:          # n is the start of a sequence
            length = 1
            while n + length in num_set:
                length += 1
            best = max(best, length)
    return best
```

**Why O(n)?** Each number is the start of at most one sequence, so the inner `while` loop across all outer iterations runs O(n) total.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Two Sum | O(n) | O(n) |
| Group Anagrams | O(n · k log k) where k = max word length | O(n · k) |
| Longest Consecutive Sequence | O(n) | O(n) |

## Common variations

- **Two Sum II** (sorted array) — two pointers, O(1) space
- **Subarray Sum Equals K** — prefix sum + hash map (see prefix-sums concept)
- **Contains Duplicate** — `return len(nums) != len(set(nums))`
- **Top K Frequent Elements** — `Counter.most_common(k)` or bucket sort by frequency

## vs other languages

Python's `dict` preserves insertion order since 3.7 — Java's `HashMap` does not. When order matters use `dict`; when you need sorted order use `SortedDict` from `sortedcontainers` (not stdlib). Python's `set` uses the same hash table as `dict` — both have O(1) average lookup.

`collections.defaultdict(list)` eliminates `if key not in d: d[key] = []`. `collections.Counter` is a `dict` subclass with a `most_common()` method and safe subtraction. Tuple keys work in Python dicts — useful for 2D coordinate problems: `grid[(r, c)] = val`.

## Watch out

- **Hash collision worst case is O(n)**, but CPython uses a randomized hash seed (PYTHONHASHSEED) since 3.3, making adversarial inputs impractical in interviews.
- **Mutable types can't be dict keys.** You can't do `d[[1,2]] = x`. Use tuples or frozensets.
- **`defaultdict` returns a default value even on read** — this creates the key as a side effect. Use `d.get(key, default)` if you don't want key creation.
- **Iterating over a `set` is unordered** — don't assume any iteration order.
- **`group_anagrams` with an empty list** should return `[]`, which `defaultdict` handles correctly.

## FAANG follow-up questions

> "Can you solve `longest_consecutive_sequence` in O(n log n)?" — Yes, sort then scan for runs. The O(n) hash set solution is the expected answer at FAANG.

> "What if the input to `two_sum` can have multiple valid pairs?" — Clarify with the interviewer. The standard version assumes exactly one. If multiple, collect all pairs, which is O(n²) worst case.

> "How would you handle `group_anagrams` if the alphabet is only lowercase a-z?" — Replace `sorted(word)` with a `tuple` of 26 character counts: `key = tuple(word.count(c) for c in 'abcdefghijklmnopqrstuvwxyz')`. This is O(26·n) = O(n) vs O(k log k) for sort.

## The task

```python
def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    """Return indices (i, j) with i < j where nums[i] + nums[j] == target.
    Return None if no such pair exists. Assume at most one valid answer."""

def group_anagrams(words: list[str]) -> list[list[str]]:
    """Group words that are anagrams of each other. Order within groups and
    between groups does not matter."""

def longest_consecutive_sequence(nums: list[int]) -> int:
    """Return the length of the longest consecutive integer sequence in nums.
    The sequence elements don't need to be contiguous in the array."""
```

**Examples:**
- `two_sum([2,7,11,15], 9)` → `(0, 1)`
- `two_sum([3,2,4], 6)` → `(1, 2)`
- `two_sum([1,2,3], 10)` → `None`
- `group_anagrams(["eat","tea","tan","ate","nat","bat"])` → `[["eat","tea","ate"],["tan","nat"],["bat"]]` (any order)
- `longest_consecutive_sequence([100,4,200,1,3,2])` → `4` (sequence: 1,2,3,4)
- `longest_consecutive_sequence([0,3,7,2,5,8,4,6,0,1])` → `9`
- `longest_consecutive_sequence([])` → `0`
