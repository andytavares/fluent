## What you build

You write three functions with STL containers and algorithms: `unique_sorted`, `word_count` and `top_n`. The STL containers, such as `vector` and `map`, are class templates. This lesson builds on **Templates**.

## Key concepts

### `std::vector` is the default sequence container

A `vector` is a dynamic array. It grows when you add elements.

```cpp
#include <vector>
std::vector<int> nums = {3, 1, 4, 1, 5};
nums.push_back(9);
nums.size();  // 6
nums[0];      // 3
```

### `std::map` keeps its keys sorted

A `map` is a red-black tree with O(log n) operations. Iteration always gives the keys in sorted order. Python's `dict` keeps insertion order, and a hash map keeps no order.

```cpp
#include <map>
std::map<std::string, int> scores;
scores["Alice"] = 95;
scores["Bob"]   = 87;
// 1: key exists
scores.count("Alice");
// 0: key absent
scores.count("Carol");
```

### `std::unordered_map` is a hash map

Operations are O(1) on average. The map gives no order guarantee. `operator[]` default-constructs the value on first access, `0` for `int`. So `freq["go"]++` works before `"go"` is a key.

```cpp
#include <unordered_map>
std::unordered_map<std::string, int> freq;
freq["go"]++;
freq["go"]++;
// freq["go"] == 2
```

### Algorithms work on iterator ranges

The functions in `<algorithm>` and `<numeric>` take a range `[begin, end)`, not a container. This works on subranges and streams too. Python, Ruby and JS put these methods on the collection instead.

```cpp
#include <algorithm>
#include <numeric>

std::sort(nums.begin(), nums.end());
int total = std::accumulate(
    nums.begin(), nums.end(), 0);
auto it = std::find_if(
    nums.begin(), nums.end(),
    [](int n) { return n > 3; });
```

### Erase-remove removes elements for real

`std::remove` and `std::unique` do not shrink the container. They move the kept elements to the front and return the new logical end. You must `erase` the tail.

```cpp
std::sort(v.begin(), v.end());
// Now v has no duplicates
v.erase(
    std::unique(v.begin(), v.end()),
    v.end());
```

### Range-based `for` visits each element

With a `map`, each element is a key-value pair. Structured bindings name both parts.

```cpp
for (const auto& [key, val] : scores) {
    std::cout << key << ": "
              << val << "\n";
}
```

## Watch out

- `std::unique` removes only consecutive duplicates. On `{1, 3, 1}` it does nothing. Sort first.
- Erasing from a `vector` in a loop invalidates the iterators after the erase point.
- Do not call `v.erase(it)` and then `++it`. Use the iterator that `erase` returns, or use erase-remove.
- `operator[]` on a `map` or `unordered_map` inserts a default value if the key is missing.
- Even `if (m["key"] == 5)` changes the map. Use `.count(key)` or `.find(key)` to test for a key.

## The task

Write three functions in `stub.cpp` with STL containers and algorithms.

1. `std::vector<int> unique_sorted(std::vector<int> v)` returns the elements of `v`, sorted ascending, with duplicates removed.
2. `std::unordered_map<std::string, int> word_count(const std::string& text)` counts how many times each word appears in `text`.
3. In `word_count`, one or more spaces separate the words. An empty `text` gives an empty map.
4. `std::vector<int> top_n(std::vector<int> v, int n)` returns the `n` largest elements of `v`, sorted descending.
5. If `v` has fewer than `n` elements, `top_n` returns all of them, sorted descending.

An empty input vector gives an empty result for `unique_sorted` and `top_n`.

```cpp
unique_sorted({3, 1, 4, 1, 5, 9, 2, 6, 5});
// {1, 2, 3, 4, 5, 6, 9}
unique_sorted({1, 2, 3}); // {1, 2, 3}
unique_sorted({5, 5, 5}); // {5}
unique_sorted({});        // {}

auto wc = word_count(
    "the cat sat on the mat the cat");
wc["the"];        // 3
wc["cat"];        // 2
wc["sat"];        // 1
wc.count("dog");  // 0
word_count("");   // {} (empty map)

top_n({3, 1, 4, 1, 5, 9, 2, 6}, 3);
// {9, 6, 5}
top_n({3, 1, 2}, 10);  // {3, 2, 1}
top_n({}, 3);          // {}
```
