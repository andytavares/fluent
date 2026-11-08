## What you build

You write four hash-map functions: `isAnagram`, `groupAnagrams`, `twoSum` and `longestConsecutive`. Hash maps and sets turn O(n²) scans into one pass. Use a `Map` or `Set` when a problem says "find a pair", "group these" or "does X appear". This lesson builds on **Matrix**.

## Key concepts

### Frequency counting answers questions about counts

Count occurrences in one pass, then answer questions about the counts. Ransom Note, Valid Anagram and many string problems rest on this.

```ts
const counts = new Map<string, number>();
for (const c of s) {
  counts.set(c, (counts.get(c) ?? 0) + 1);
}
```

Learn the increment-or-start idiom `(counts.get(c) ?? 0) + 1`. To compare two strings, count up over one and count down over the other. A count that goes below zero means a mismatch.

### `Map` and `Set` beat plain objects as tables

Use `Map` and `Set`, not `{}`:

| | `Map` / `Set` | plain object |
|---|---|---|
| Key types | anything, no coercion | strings/symbols only (`obj[1]` and `obj["1"]` collide) |
| Size | `.size`, O(1) | `Object.keys(obj).length`, O(n) |
| Prototype pollution | none | `"constructor" in obj` is `true` before you ever set it |
| Membership | `.has(k)` | `k in obj` also finds inherited keys |

The prototype row is a real interview bug. A plain-object frequency table keyed by input strings breaks on `"constructor"` or `"toString"`.

### A canonical key groups equivalent items

To group items that are "the same" under some equivalence, compute a canonical form and use it as the map key. Anagrams and isomorphic shapes work this way. For anagrams, the key is the sorted string.

```ts
// groups: key -> words; s: one word
// "eat", "tea", "ate" -> all "aet"
const key = [...s].sort().join("");
if (!groups.has(key)) groups.set(key, []);
groups.get(key)!.push(s);
```

Items with the same signature land in the same bucket. A 26-slot count array joined into a string (`"1#0#2#..."`) is the O(k) key when a sort of each string is too slow.

### A value-to-index map finds the complement

Two Sum takes one pass. For each element, ask the map whether its complement (`target - x`) appeared already. Check before you insert the current element, so an element never pairs with itself.

```ts
// value -> index
const seen = new Map<number, number>();
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen.has(complement)) {
    return [seen.get(complement)!, i];
  }
  seen.set(nums[i], i);
}
```

### Set membership: start work only at a run's start

Longest Consecutive Sequence looks like it needs a sort. A `Set` gives O(1) membership, and one guard makes the scan linear. Start a count only from a number that begins a run, with no `n - 1` in the set. The scan then visits each element at most twice: once in the outer loop and once inside one run walk.

```ts
const set = new Set(nums);
for (const n of set) {
  // Not a run start: skip.
  if (set.has(n - 1)) continue;
  let len = 1;
  // Walk the run once.
  while (set.has(n + len)) len++;
}
```

Without the guard, every member of a run walks it again. One long run then costs O(n²).

### A seen-set detects a cycle

A process that repeats a deterministic step (`n -> f(n)`) over a bounded state space must repeat a state. Record every state in a `Set`. A repeat means a loop that never makes progress (Happy Number). The O(1)-space alternative is Floyd's tortoise and hare, which the linked list concept uses again.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Valid Anagram | O(n) | O(k) alphabet | count up / count down |
| Group Anagrams | O(n · k log k) | O(n · k) | canonical (sorted) key |
| Two Sum | O(n) | O(n) | value → index + complement |
| Longest Consecutive Sequence | O(n) | O(n) | set + run-start guard |

## Watch out

- In Two Sum, check the complement before you insert. Otherwise `target = 2 × nums[i]` returns `[i, i]`.
- `Map` keys do not coerce. After `map.set(1, ...)`, `map.get("1")` is `undefined`. Choose number or string keys up front. A `Map<number, V>` rejects a string key at compile time.
- The run-start guard is the whole algorithm in Longest Consecutive Sequence. Without it, small tests pass but one long run goes quadratic.
- Write `[...s].sort().join("")`, not `s.sort()`. Strings are immutable, so spread them into an array first.
- Single characters sort correctly without a comparator.
- In anagram problems, check the lengths first. Different lengths are never anagrams.
- With equal lengths, a "never goes negative" check in the count-down is enough. No leftover pass is necessary.
- Word Pattern and Isomorphic Strings need the mapping in both directions. One map catches only one direction of a conflict.
- Duplicates such as Two Sum's `[3, 3]` need no special handling. Do not dedupe the input first.
- `Map.get` returns `V | undefined`. Use `!` only right after a `has` or `set` on that key.

## Problem walkthroughs

### Ransom Note

**Problem.** Given strings `ransomNote` and `magazine`, return `true` if you can build the note from the magazine's letters. You can use each magazine letter at most once.

**Example.**

```text
"aa", "ab"  -> false
"aa", "aab" -> true
```

**Steps.**
1. Exit early if `ransomNote.length > magazine.length`. The note cannot fit.
2. Count every character of `magazine` into a map.
3. Walk `ransomNote`. For each character, look up its count. If it is missing or zero, return `false`. Otherwise decrement it.
4. Return `true` after the walk. Every note letter found an unused magazine letter.

**Complexity.** O(m + n) time / O(k) space for the letters in use.

### Isomorphic Strings

**Problem.** Two strings `s` and `t` of equal length are isomorphic if a character replacement turns `s` into `t`. Every occurrence of a character maps to the same character, and no two characters map to the same one. Return `true` if they are isomorphic.

**Example.**

```text
"egg", "add"   -> true  (e->a, g->d)
"foo", "bar"   -> false
(o maps to both a and r)
"badc", "baba" -> false
(b and d both map to b)
```

**Steps.**
1. Keep two maps: `sToT` and `tToS`.
2. Walk both strings together. Take each pair `(a, b)`.
3. If `sToT` maps `a` to a value other than `b`, return `false`. If `tToS` maps `b` to a value other than `a`, return `false`.
4. Otherwise record `sToT.set(a, b)` and `tToS.set(b, a)`.
5. The two maps enforce a bijection. One map alone misses two source characters on the same target.

**Complexity.** O(n) time / O(k) space.

### Word Pattern

**Problem.** Given `pattern` (letters) and `s` (words separated by spaces), return `true` if the words follow the pattern. The pattern letters and the words must form a bijection.

**Example.**

```text
"abba", "dog cat cat dog"  -> true
"abba", "dog cat cat fish" -> false
"abba", "dog dog dog dog"  -> false
```

**Steps.**
1. Set `const words = s.split(" ")`. If `words.length !== pattern.length`, return `false`.
2. Use the two-map method from Isomorphic Strings, with letters and words: `letterToWord` and `wordToLetter`.
3. For each `(letter, word)` pair, reject a conflict with an entry in either map. Otherwise record both directions.
4. This is Isomorphic Strings with words as the second alphabet. Spot that reduction in the interview.

**Complexity.** O(n) time / O(n) space for the word map.

### Valid Anagram ★

**Problem.** Return `true` if `t` is an anagram of `s`: the same characters with the same counts, in another order.

**Example.**

```text
"anagram", "nagaram" -> true
"rat", "car" -> false
```

**Steps.**
1. If the lengths differ, return `false`. This also makes the one-direction check in step 3 enough.
2. Count up over `s`: `counts.set(c, (counts.get(c) ?? 0) + 1)`.
3. Count down over `t`. If `counts.get(c)` is missing or zero, return `false`. Otherwise decrement it.
4. Return `true`. Equal lengths and "never goes negative" mean every count ends at zero. No leftover check is necessary.

**Complexity.** O(n) time / O(k) space. This beats a sort of both strings, which costs O(n log n).

### Group Anagrams ★

**Problem.** Given an array of strings, group the anagrams together. Return an array of groups. The order of groups and the order inside a group do not matter.

**Example.**

```text
["eat","tea","tan","ate","nat","bat"]
-> [["eat","tea","ate"],
    ["tan","nat"], ["bat"]]
```

**Steps.**
1. Create a `Map<string, string[]>`.
2. For each string, compute its canonical key: `[...str].sort().join("")`. Anagrams, and only anagrams, give the same key.
3. Append the string to the bucket at that key. Create the bucket on first sight.
4. Return `[...groups.values()]`.
5. For lowercase input, a 26-count key (`counts.join("#")`) drops the cost per string from O(k log k) to O(k).

**Complexity.** O(n · k log k) time for n strings of length up to k / O(n · k) space.

### Two Sum ★

**Problem.** Given `nums` and `target`, return the indexes of the two distinct positions whose values sum to `target`. Exactly one answer exists. Unlike Two Sum II in **Two Pointers**, the array is not in order. A sort destroys the indexes you must return.

**Example.**

```text
[2,7,11,15], target 9 -> [0,1]
[3,3], target 6 -> [0,1]
```

**Steps.**
1. Create `seen: Map<number, number>`, from value to index.
2. For each index `i`, compute `complement = target - nums[i]`.
3. If `seen.has(complement)`, return `[seen.get(complement)!, i]`. The stored index is always the smaller one.
4. Otherwise set `seen.set(nums[i], i)` and continue.
5. The check before the insert makes `[3, 3]` with target 6 work: the second 3 finds the first. A single 3 cannot match itself.

**Complexity.** O(n) time / O(n) space. The map buys back the order information that two pointers got from a sorted array.

### Happy Number

**Problem.** Replace a positive integer `n` with the sum of the squares of its digits, again and again. `n` is happy if this process reaches 1. Return `true` if it does. An unhappy number loops forever without 1.

**Example.**

```text
19 -> 1² + 9² = 82 -> 68 -> 100 -> 1
  -> true
2 -> 4 -> 16 -> 37 -> ... -> 4
  (cycle) -> false
```

**Steps.**
1. Write the step function `sumOfSquaredDigits(n)`. Take digits with `n % 10` and `Math.floor(n / 10)`, and add up `digit * digit`.
2. Keep a `Set` of every value you see. In the loop, if `n === 1`, return `true`. If the set already has `n`, you are in a cycle, so return `false`.
3. Otherwise add `n` to the set and take a step.
4. The loop always ends. A number with `d` digits maps to at most `81d`, so large values shrink. The reachable states are finite, so the process repeats or reaches 1.
5. The O(1)-space alternative is Floyd's cycle detection. The slow pointer takes one step and the fast pointer takes two. A meeting anywhere other than 1 means a cycle.

**Complexity.** O(log n) per step to read the digits, with a bounded number of steps / O(1) space with Floyd, a small bounded set otherwise.

### Contains Duplicate II

**Problem.** Given `nums` and an integer `k`, return `true` if two indexes `i ≠ j` have `nums[i] === nums[j]` and `|i - j| <= k`.

**Example.**

```text
[1,2,3,1], k = 3 -> true
[1,2,3,1,2,3], k = 2 -> false
```

**Steps.**
1. Keep `lastIndex: Map<number, number>`, from each value to its latest index.
2. For each `i`, if the map has `nums[i]` and `i - lastIndex.get(nums[i]) <= k`, return `true`.
3. In both cases, set `lastIndex.set(nums[i], i)`. Only the latest earlier occurrence can be within `k` of a future index, so the overwrite loses nothing.
4. Another view is a sliding-window `Set` of the last `k` elements. Add `nums[i]` and evict `nums[i - k]`. The time is the same, and memory stays within `k`.

**Complexity.** O(n) time / O(min(n, k)) space with the window set, O(n) with the map.

### Longest Consecutive Sequence ★

**Problem.** Given an array in no order, return the length of the longest run of consecutive integers. Runs are by value, not by position. The time must be O(n), so you cannot sort.

**Example.**

```text
[100,4,200,1,3,2] -> 4
(the run 1,2,3,4)
[] -> 0
```

**Steps.**
1. Put every value into a `Set`. The set removes duplicates and gives O(1) membership.
2. For each value `n` in the set, check `set.has(n - 1)`. If it is present, `n` is inside a run, so skip it.
3. If `n` starts a run, walk upward with `while (set.has(n + len)) len++`. Fold `len` into the best.
4. The guard proves linearity. You walk each run once, from its unique start, so the total inner-loop work is O(n).

**Complexity.** O(n) time / O(n) space. A sort costs O(n log n), and the problem forbids it.

## Interview follow-ups

- After **Two Sum**: "The array is in order. Can you beat O(n) space?" Use converging pointers with O(1) space, as in Two Sum II. "Return all pairs, no duplicates?" Sort, then use two pointers with duplicate skips.
- After **Group Anagrams**: "What if strings have millions of characters?" Use a 26-count key: O(k) per string instead of O(k log k).
- After **Valid Anagram**: "Unicode input?" A `Map` already handles it. A fixed 26-slot array does not, so say so out loud.
- After **Happy Number**: "O(1) space?" Use Floyd's tortoise and hare on the step function.
- After **Longest Consecutive Sequence**: "Why is this O(n) with a nested while loop?" Amortization: you visit each element at most twice, because the run-start guard prevents repeat walks.

## The task

You write four hash-map functions. Each runs in the stated time. `Map` and `Set` operations count as O(1).

1. `isAnagram(s, t)` returns `true` if `t` is an anagram of `s`. Both strings hold the same characters with the same counts.
2. The comparison is case-sensitive, and every character counts. Use O(n) time. Do not sort.
3. `groupAnagrams(strs)` returns an array of arrays. Each inner array holds all strings from `strs` that are anagrams of each other.
4. Every input string appears in exactly one group. The order of groups, and of strings inside a group, does not matter.
5. Duplicate strings are separate entries, and they all land in the same group.
6. `twoSum(nums, target)` takes an unordered array `nums` and an integer `target`.
7. It returns the 0-based indexes `[i, j]`, with `i < j`, of two distinct positions that sum to `target`.
8. Exactly one solution exists. You cannot use the same position twice. Two equal values at different positions are fine.
9. Use one pass with a map, in O(n) time. A sort loses the indexes.
10. `longestConsecutive(nums)` returns the length of the longest run of consecutive integer values in `nums`. Positions do not matter.
11. The array is in no order and can hold duplicates. Use O(n) time with a `Set`. Do not sort.

Edge cases:

- `isAnagram`: strings of different lengths are always `false`. Two empty strings are `true`.
- `isAnagram`: the same character set with different counts is `false`, for example `"aacc"` and `"ccac"`.
- `groupAnagrams`: an empty input array returns `[]`. Handle a single string and empty strings, which group together.
- `groupAnagrams`: duplicate strings join one group. A string with no anagram partner forms its own group.
- `twoSum`: handle duplicate values in the pair, negative numbers, a `target` of 0 and a pair at the two ends.
- `longestConsecutive`: an empty array returns `0`, and a single element returns `1`. Duplicates inside a run do not lengthen it.
- `longestConsecutive`: handle negative values and runs that cross zero. With no consecutive values, the answer is `1`.

```ts
isAnagram("anagram", "nagaram"); // true
isAnagram("rat", "car");         // false
isAnagram("ab", "a");            // false
isAnagram("", "");               // true
isAnagram("aacc", "ccac");       // false

groupAnagrams(["eat", "tea", "tan",
  "ate", "nat", "bat"]);
// [["eat","tea","ate"],
//  ["tan","nat"], ["bat"]] (any order)
groupAnagrams([]);            // []
groupAnagrams([""]);          // [[""]]
groupAnagrams(["a"]);         // [["a"]]
groupAnagrams(["ab", "ba", "ab"]);
// [["ab", "ba", "ab"]] (any order)

twoSum([2, 7, 11, 15], 9);    // [0, 1]
twoSum([3, 2, 4], 6);         // [1, 2]
twoSum([3, 3], 6);            // [0, 1]
twoSum([5, -7, 2, 7], 0);     // [1, 3]

longestConsecutive(
  [100, 4, 200, 1, 3, 2]);    // 4
longestConsecutive([]);              // 0
longestConsecutive([10, 20, 30]);    // 1
longestConsecutive([-2, 1, -1, 0]);  // 4
longestConsecutive([1, 2, 2, 3]);    // 3
```
