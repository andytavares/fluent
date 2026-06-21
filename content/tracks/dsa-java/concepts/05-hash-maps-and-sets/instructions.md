# Hash Maps and Sets

## What you'll learn

How to trade O(n) space for O(1) lookup time — the core pattern behind dozens of interview problems. Once you recognize the "complement lookup" and "group by key" shapes, most hash map problems become mechanical.

## Key concepts

### Pattern 1 — Complement lookup (Two Sum)

For each element, ask "have I already seen the value that completes the pair?" One pass, O(n).

```java
var seen = new HashMap<Integer, Integer>(); // value -> index
for (int i = 0; i < nums.length; i++) {
    int complement = target - nums[i];
    if (seen.containsKey(complement)) {
        return new int[]{seen.get(complement), i};
    }
    seen.put(nums[i], i);
}
```

### Pattern 2 — Group by canonical key (Group Anagrams)

All anagrams share the same sorted form. Use the sorted form as a map key to bucket them.

```java
var groups = new HashMap<String, List<String>>();
for (String word : words) {
    char[] chars = word.toCharArray();
    Arrays.sort(chars);
    String key = new String(chars);
    groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
}
return new ArrayList<>(groups.values());
```

`computeIfAbsent` creates the list on first access and returns it — cleaner than a `containsKey` + `put` + `get` triple.

### Pattern 3 — Sequence detection with HashSet (Longest Consecutive Sequence)

Only start counting a sequence from its smallest element (no predecessor in the set). This ensures each element is visited at most twice.

```java
var set = new HashSet<Integer>();
for (int n : nums) set.add(n);

int longest = 0;
for (int n : set) {
    if (!set.contains(n - 1)) { // n is the start of a sequence
        int length = 1;
        while (set.contains(n + length)) length++;
        longest = Math.max(longest, length);
    }
}
return longest;
```

The `!set.contains(n - 1)` guard is why this is O(n) and not O(n²): inner `while` only runs for sequence starts.

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `twoSum` | O(n) | O(n) | One pass; map stores at most n entries |
| `groupAnagrams` | O(n · k log k) | O(n · k) | Sort each word of length k; store all words |
| `longestConsecutiveSequence` | O(n) | O(n) | Each element added/checked at most twice |

## Common variations this pattern solves

1. **Contains Duplicate** — `HashSet.add` returns false if already present
2. **Intersection of Two Arrays** — set intersection; `retainAll` or manual loop
3. **Top K Frequent Elements** — frequency map + bucket sort by frequency
4. **Isomorphic Strings** — two maps: forward and backward character mapping

## vs other languages

Python's `dict` and `set` are identical in concept to Java's `HashMap` and `HashSet`, but Python's `Counter(words)` and `defaultdict(list)` eliminate boilerplate. In Java, `merge` and `computeIfAbsent` are the idiomatic equivalents.

Go's maps auto-initialize to zero values; Java's maps return `null` for missing keys. Java `int` primitives can't be stored directly — they're autoboxed to `Integer`. Use `getOrDefault(key, 0)` to avoid null pointer exceptions.

## Watch out

- **`==` vs `.equals()` on `Integer`**: `seen.get(complement) == i` compares references, not values, for `Integer` objects outside the cache range (-128 to 127). Always use `.equals()` or unbox first.
- **Autoboxing cost**: `HashMap<Integer, Integer>` boxes every `int`. For performance-critical code with primitive keys, consider a third-party `IntIntHashMap`. In interviews, `HashMap` is always acceptable.
- **`computeIfAbsent` vs `getOrDefault`**: `computeIfAbsent` is for building collections (creates on first access). `getOrDefault` is for reading with a fallback. Using `getOrDefault` to build a list of lists is a common antipattern.
- **`longestConsecutiveSequence` in O(n log n)** with sorting is also valid. The O(n) HashSet approach is what interviewers expect when they specify O(n).

## FAANG follow-up questions

> "Why not sort for longestConsecutiveSequence?" — Sorting is O(n log n). The HashSet approach is O(n). Both are correct; the follow-up is usually "can you do O(n)?"
>
> "What if there are duplicates in longestConsecutiveSequence?" — Adding all values to a `HashSet` first deduplicates them, so duplicates don't affect correctness.
>
> "How would you handle groupAnagrams if words can be up to 50,000 characters long?" — Sorting each word is O(k log k). An alternative key is a character frequency array: `new int[26]` — hashed to a string like `"1#0#2#..."`. This avoids the sort, giving O(k) per word.
>
> "What is the worst-case time complexity of HashMap operations?" — O(n) due to hash collisions (all keys map to the same bucket). In practice with a good hash function and load factor ≤ 0.75, it's amortized O(1).

## The task

Implement three methods in `Solution`:

```java
// Returns indices [i, j] such that nums[i] + nums[j] == target.
// Exactly one solution exists; i != j.
// [2,7,11,15], target=9 -> [0,1]
public static int[] twoSum(int[] nums, int target)

// Groups words that are anagrams of each other into sublists.
// Order of groups and elements within groups does not matter.
// ["eat","tea","tan","ate","nat","bat"] -> [["eat","tea","ate"],["tan","nat"],["bat"]]
public static List<List<String>> groupAnagrams(String[] words)

// Returns the length of the longest consecutive sequence of integers.
// Input may be unsorted; O(n) required.
// [100,4,200,1,3,2] -> 4 (sequence: 1,2,3,4)
// [0,3,7,2,5,8,4,6,0,1] -> 9
public static int longestConsecutiveSequence(int[] nums)
```
