# Hash Maps and Sets

## What you'll learn

How O(1) average-case lookup turns O(n²) brute force into O(n), and three canonical patterns: complement lookup, canonical key grouping, and set-based sequence detection.

## Key concepts

The guiding question for any hash map problem: "What do I need to look up later, and what should I store now to make that lookup O(1)?"

### Complement lookup — two sum

Store what you need (the complement) as you go. When you find it, you're done.

```js
function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return [];
}
```

### Canonical key grouping — group anagrams

Any two elements that are "equivalent" under some transformation share the same canonical key.

```js
function groupAnagrams(words) {
  const map = new Map();
  for (const word of words) {
    const key = [...word].sort().join(""); // canonical form
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(word);
  }
  return [...map.values()];
}
```

Alternatives to sorting: a frequency array of 26 characters as the key (O(k) instead of O(k log k)).

### Set-based sequence detection — longest consecutive sequence

Only start counting a sequence from its lowest element. Check `!set.has(n - 1)` to identify starts.

```js
function longestConsecutiveSequence(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const n of set) {
    if (set.has(n - 1)) continue; // not a sequence start
    let len = 1;
    while (set.has(n + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}
```

The key insight: if you start counting from every element, you get O(n²). By skipping elements that have a predecessor, each element is visited at most twice — O(n) total.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| twoSum | O(n) | O(n) |
| groupAnagrams | O(n · k log k) | O(n · k) |
| longestConsecutiveSequence | O(n) | O(n) |

`k` = average word length.

## Common variations

- **Two Sum II** (sorted array) — two pointers instead of hash map; O(n) time O(1) space
- **Subarray Sum Equals K** — hash map on running prefix sums (see prefix-sums concept)
- **First missing positive** — use the array itself as a hash map (cyclic sort or mark negative)
- **Top K frequent elements** — frequency map + bucket sort or min-heap

## vs other languages

JavaScript's `Map` preserves insertion order and accepts any key type. Python's `dict` is similar. Java's `HashMap` does not preserve order — use `LinkedHashMap` if you need it. This distinction matters in "most frequent" problems when you must return elements in input order.

## FAANG follow-up questions

After twoSum:
- "What if the array is sorted?" (use two pointers — O(1) space)
- "What if you need all unique pairs, not indices?" (sort + two pointers with duplicate skipping)
- "What if numbers can overflow int32?" (acknowledge and use BigInt or long in typed languages)

After longestConsecutiveSequence:
- "Can you do it in O(n log n)?" (sort, then scan — simpler but slower)
- "What if there are duplicates?" (the Set deduplicates them naturally; the algorithm still works)
- "What if input is a stream?" (you'd need a sorted set / balanced BST to maintain order incrementally)

After groupAnagrams:
- "Is sorting the best canonical key?" (no — a frequency count of 26 letters is O(k) not O(k log k))

## Watch out

- **twoSum duplicate values**: `[3, 3]` with target 6 — you must insert `nums[i]` into the map *after* checking for the complement. If you insert first, index 0 maps to itself.
- **longestConsecutiveSequence**: iterate over `set`, not `nums`. If `nums` has duplicates, iterating `nums` gives wrong length counting since the number appears multiple times.
- **Map vs object**: `new Map()` handles numeric keys correctly (no prototype pollution, no coercion). Using a plain object (`{}`) converts numeric keys to strings — fine for small numbers but be consistent.
- **groupAnagrams empty string**: `"".split("").sort().join("")` returns `""` — the empty string maps to itself, which is correct.

## The task

### `twoSum(nums, target)`

Return the indices `[i, j]` of the two numbers that add up to `target`. Exactly one solution is guaranteed. You may not use the same element twice.

```js
twoSum([2, 7, 11, 15], 9) // [0, 1]
twoSum([3, 2, 4], 6)      // [1, 2]
twoSum([3, 3], 6)          // [0, 1]
```

### `groupAnagrams(words)`

Group the anagrams together. Return an array of groups; order within groups and order of groups does not matter.

```js
groupAnagrams(["eat","tea","tan","ate","nat","bat"])
// [["eat","tea","ate"], ["tan","nat"], ["bat"]]
groupAnagrams([""])  // [[""]]
groupAnagrams(["a"]) // [["a"]]
```

### `longestConsecutiveSequence(nums)`

Return the length of the longest consecutive sequence in an unsorted array. Must run in O(n).

```js
longestConsecutiveSequence([100, 4, 200, 1, 3, 2]) // 4  (1,2,3,4)
longestConsecutiveSequence([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) // 9
longestConsecutiveSequence([])  // 0
longestConsecutiveSequence([1]) // 1
```
