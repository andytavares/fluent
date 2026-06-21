# Hash Maps and Sets

## What you'll learn

How `Map<K, V>` and `Set<T>` give O(1) average lookup to collapse O(n²) brute-force problems to O(n). You'll implement three problems of increasing difficulty: two sum (complement lookup), group anagrams (canonical key grouping), and longest consecutive sequence (Set-based O(n) graph walk).

## Key concepts

### Complement lookup (Two Sum)

Store "what you've seen so far" in a map. For each element, ask "has its complement already passed by?"

```typescript
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i); // record AFTER checking, so we don't use same index twice
  }
  return null;
}
```

### Canonical key grouping (Group Anagrams)

Sort each word's characters to produce a key that's identical for all anagrams, then bucket by that key.

```typescript
function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of words) {
    const key = [...word].sort().join(""); // O(k log k) per word
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(word);
    } else {
      groups.set(key, [word]);
    }
  }
  return Array.from(groups.values());
}
```

**Alternative key**: use a character frequency array `[0,0,0,...,0]` (26 entries) serialized as a string — O(k) per word vs O(k log k). Useful when k is large.

### Set-based consecutive sequence walk

The key insight: for each number `n`, only start a sequence walk if `n - 1` is NOT in the set. This way each sequence is walked exactly once.

```typescript
function longestConsecutiveSequence(nums: number[]): number {
  const set = new Set(nums); // O(n)
  let longest = 0;

  for (const n of set) {
    // Only start a walk from the sequence's beginning
    if (!set.has(n - 1)) {
      let length = 1;
      let current = n;
      while (set.has(current + 1)) {
        current++;
        length++;
      }
      longest = Math.max(longest, length);
    }
  }
  return longest;
}
// Total work: each number is visited at most twice (once in outer loop, once in while).
// O(n) time, O(n) space.
```

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `twoSum` | O(n) | O(n) | One pass with complement map |
| `groupAnagrams` | O(n · k log k) | O(n · k) | k = avg word length |
| `longestConsecutiveSequence` | O(n) | O(n) | Set lookup; each num visited ≤ 2 times |

## Common variations

- **Two Sum II (sorted)** — use two pointers instead; O(1) space
- **Four Sum** — sort + reduce to two sum with two nested loops
- **Isomorphic strings** — maintain two maps (forward and backward) to check bijection
- **Subarray sum equals k** — prefix sum + map (covered in prefix-sums concept)

## vs other languages

Python's `dict` and `set` are the idiomatic tools. In Go, `map[int]int`. TypeScript: use `Map<K, V>` over plain objects for algorithm work — `Map` accepts any key type (including objects by identity), preserves insertion order, has O(1) `.size`, and avoids prototype pollution. `{"constructor": 1}` is a valid `Map` entry but would shadow `Object.prototype.constructor` on a plain object.

## Watch out

- **Same index twice in Two Sum**: insert the current element AFTER the lookup, not before. If you insert first, `nums[i]` might match itself when `target === 2 * nums[i]`.
- **`seen.get(complement)!`**: the `!` non-null assertion is safe because you just called `seen.has(complement)`. If you remove the `has` check and use `get` directly, `!` will hide a potential `undefined`.
- **`longestConsecutiveSequence` with duplicates**: `new Set(nums)` deduplicates automatically. If you work with the array directly and don't deduplicate, a run like `[1, 2, 2, 3]` double-counts.
- **Map vs object performance**: for large n, `Map` is consistently faster than `{}` in V8 because it avoids property lookup machinery.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "Can `longestConsecutiveSequence` be solved in O(n log n)?" (Yes — sort and scan. The O(n) set approach is the expected answer, but O(n log n) is valid and simpler.)
> - "How would `groupAnagrams` scale if strings are very long?" (Switch the key to a 26-element frequency array serialized as `[1,0,0,...,2,...].toString()` — O(k) per word instead of O(k log k).)
> - "What if `twoSum` needs to return all pairs?" (Change return type to `[number, number][]`; use a set for seen values rather than a map; collect all matching pairs.)
> - "How would you handle integer overflow in the complement calculation?" (Not a JS/TS issue since numbers are 64-bit floats with 53-bit integer precision, but in Java/C you'd use `long` or check bounds.)

## The task

Implement three functions:

```typescript
// Return the indices [i, j] where nums[i] + nums[j] === target, or null.
// Each input has exactly one solution. Do not use the same index twice.
// [2,7,11,15], target=9 → [0,1]
// [3,2,4],     target=6 → [1,2]
function twoSum(nums: number[], target: number): [number, number] | null

// Group strings that are anagrams of each other.
// Order of groups and order within groups does not matter.
// ["eat","tea","tan","ate","nat","bat"] →
//   [["eat","tea","ate"],["tan","nat"],["bat"]] (any order)
function groupAnagrams(words: string[]): string[][]

// Return the length of the longest consecutive integer sequence in nums.
// Must run in O(n) time.
// [100,4,200,1,3,2] → 4  (sequence: 1,2,3,4)
// [0,3,7,2,5,8,4,6,0,1] → 9
function longestConsecutiveSequence(nums: number[]): number
```
