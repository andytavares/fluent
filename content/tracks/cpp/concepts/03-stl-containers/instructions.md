# STL Containers

## What you'll learn

Building on the templates from lesson 2 — the STL containers (`vector`, `map`, `unordered_map`, ...) are themselves class templates. The Standard Template Library provides ready-to-use containers and algorithms (`sort`, `find_if`, `accumulate`) that work with any of them through a common iterator interface.

## Key concepts

**`std::vector`** — dynamic array, the default sequence container:
```cpp
#include <vector>
std::vector<int> nums = {3, 1, 4, 1, 5};
nums.push_back(9);
nums.size();        // 6
nums[0];            // 3
```

**`std::map`** — sorted key-value store (O(log n) operations, red-black tree):
```cpp
#include <map>
std::map<std::string, int> scores;
scores["Alice"] = 95;
scores["Bob"]   = 87;
scores.count("Alice");  // 1 (key exists)
scores.count("Carol");  // 0 (key absent)
```

**`std::unordered_map`** — hash map (O(1) average, no ordering guarantee):
```cpp
#include <unordered_map>
std::unordered_map<std::string, int> freq;
freq["go"]++;
freq["go"]++;  // freq["go"] == 2
```
`operator[]` default-constructs the value (`0` for `int`) on first access — this is what makes `freq["go"]++` work even before `"go"` exists as a key.

**Algorithms from `<algorithm>` and `<numeric>`** operate on iterator ranges, not containers directly:
```cpp
#include <algorithm>
#include <numeric>

std::sort(nums.begin(), nums.end());
int total = std::accumulate(nums.begin(), nums.end(), 0);
auto it   = std::find_if(nums.begin(), nums.end(), [](int n){ return n > 3; });
```

**The erase-remove idiom** — `std::remove`/`std::unique` don't shrink the container, they just move elements to the front and return a new logical end; you must `erase` the tail:
```cpp
std::sort(v.begin(), v.end());
v.erase(std::unique(v.begin(), v.end()), v.end());  // now actually deduplicated
```

**Range-based for:**
```cpp
for (const auto& [key, val] : scores) {
    std::cout << key << ": " << val << "\n";
}
```

**vs other languages:** STL algorithms operate on iterator ranges `[begin, end)` rather than on the container directly — more flexible (works on subranges, streams) than Python/Ruby/JS built-in collection methods, but requires getting used to the pair-of-iterators pattern. `std::map`'s ordering is a real behavioral difference from Python's `dict` (insertion order) or a hash-based map — iterate a `map` and you get keys sorted, always.

## Watch out

- **`std::unique` requires the range to already be sorted.** It only removes *consecutive* duplicates — `std::unique` on `{1, 3, 1}` does nothing, because the two `1`s aren't adjacent. Sort first.
- **Erasing from a `std::vector` while iterating invalidates iterators** past the erase point. Don't do `for (auto it = v.begin(); it != v.end(); ++it) if (...) v.erase(it);` — use the return value of `erase` or the erase-remove idiom instead.
- **`operator[]` on a `map`/`unordered_map` inserts** a default value if the key is missing — even a read-only-looking `if (m["key"] == 5)` mutates the map. Use `.count(key)` or `.find(key)` to check existence without inserting.

## The task

Implement three functions using STL containers and algorithms, in `stub.cpp`.

**`std::vector<int> unique_sorted(std::vector<int> v)`** — return a new vector containing the elements of `v`, sorted ascending, with duplicates removed.

```cpp
unique_sorted({3, 1, 4, 1, 5, 9, 2, 6, 5});  // {1, 2, 3, 4, 5, 6, 9}
unique_sorted({5, 5, 5});                    // {5}
unique_sorted({});                           // {}
```

**`std::unordered_map<std::string, int> word_count(const std::string& text)`** — count how many times each word appears in `text`, where words are separated by one or more spaces.

```cpp
auto wc = word_count("the cat sat on the mat the cat");
wc["the"];         // 3
wc["cat"];         // 2
wc["sat"];         // 1
wc.count("dog");   // 0 — key never inserted
word_count("");    // {} — empty map
```

**`std::vector<int> top_n(std::vector<int> v, int n)`** — return the `n` largest elements of `v`, sorted descending. If `v` has fewer than `n` elements, return all of them, sorted descending.

```cpp
top_n({3, 1, 4, 1, 5, 9, 2, 6}, 3);  // {9, 6, 5}
top_n({3, 1, 2}, 10);                // {3, 2, 1}  — fewer than n elements
top_n({}, 3);                        // {}
```
