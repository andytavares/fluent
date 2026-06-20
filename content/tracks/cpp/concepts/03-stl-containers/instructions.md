# STL Containers

## What you'll learn

The Standard Template Library (STL) provides ready-to-use containers — `vector`, `map`, `set`, `unordered_map` — and algorithms (`sort`, `find_if`, `accumulate`) that work with any of them via iterators.

## Key concepts

**`std::vector`** — dynamic array, the default sequence container:
```cpp
#include <vector>
std::vector<int> nums = {3, 1, 4, 1, 5};
nums.push_back(9);
nums.size();        // 6
nums[0];            // 3
```

**`std::map`** — sorted key-value store (O(log n) operations):
```cpp
#include <map>
std::map<std::string, int> scores;
scores["Alice"] = 95;
scores["Bob"]   = 87;
scores.count("Alice");  // 1 (key exists)
scores.count("Carol");  // 0 (key absent)
```

**`std::unordered_map`** — hash map (O(1) average):
```cpp
#include <unordered_map>
std::unordered_map<std::string, int> freq;
freq["go"]++;
freq["go"]++;  // freq["go"] == 2
```

**Algorithms from `<algorithm>` and `<numeric>`:**
```cpp
#include <algorithm>
#include <numeric>

std::sort(nums.begin(), nums.end());
int total = std::accumulate(nums.begin(), nums.end(), 0);
auto it   = std::find_if(nums.begin(), nums.end(), [](int n){ return n > 3; });
```

**Range-based for:**
```cpp
for (const auto& [key, val] : scores) {
    std::cout << key << ": " << val << "\n";
}
```

**vs other languages:** STL algorithms operate on iterator ranges `[begin, end)` rather than on the container directly. This is more flexible (works on subarrays, streams) but requires getting used to the pair-of-iterators pattern.

## The task

Implement three functions using STL containers and algorithms:

- `std::vector<int> unique_sorted(std::vector<int> v)` — return a new vector with duplicates removed and elements sorted ascending
- `std::unordered_map<std::string, int> word_count(const std::string& text)` — count how many times each word appears in text (words are separated by spaces)
- `std::vector<int> top_n(std::vector<int> v, int n)` — return the n largest elements in descending order (if v has fewer than n elements, return all of them sorted descending)
