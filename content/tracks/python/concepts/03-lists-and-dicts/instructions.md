# Lists & Dicts

## What you'll learn

Python's four built-in collection types — `list`, `dict`, `set`, `tuple` — and the stdlib additions in `collections`. You'll use comprehensions, `zip`, `enumerate`, and `defaultdict` as everyday tools.

## Key concepts

**Lists:**
```python
nums = [3, 1, 4, 1, 5]
nums.append(9)
nums.extend([2, 6])
nums.sort()                  # in-place
sorted_copy = sorted(nums)   # returns new list
nums[1:3]                    # slice: [1, 1]
nums[-1]                     # last element: 6
```

**Dicts (insertion-ordered since 3.7):**
```python
scores = {"alice": 95, "bob": 87}
scores["carol"] = 92
scores.get("dave", 0)        # 0 — safe lookup with default
scores.items()               # dict_items view
scores.keys()
scores.values()
{**scores, "eve": 88}        # merge via unpacking
scores | {"eve": 88}         # merge operator (3.9+)
```

**Sets:**
```python
a = {1, 2, 3}
b = {2, 3, 4}
a & b   # intersection: {2, 3}
a | b   # union: {1, 2, 3, 4}
a - b   # difference: {1}
a ^ b   # symmetric difference: {1, 4}
```

**Tuples — immutable sequences:**
```python
point = (3, 4)
x, y = point           # unpacking
a, *rest = [1, 2, 3, 4]  # starred unpacking: a=1, rest=[2,3,4]
```

**`enumerate` and `zip`:**
```python
for i, val in enumerate(["a", "b", "c"], start=1):
    print(i, val)   # 1 a, 2 b, 3 c

pairs = list(zip([1, 2, 3], ["a", "b", "c"]))
# [(1, 'a'), (2, 'b'), (3, 'c')]
```

**`collections.defaultdict`:**
```python
from collections import defaultdict

groups = defaultdict(list)
for word in ["cat", "car", "dog", "door"]:
    groups[word[0]].append(word)
# {'c': ['cat', 'car'], 'd': ['dog', 'door']}
```

## vs other languages

| Feature | Python | JavaScript | Java | Go |
|---|---|---|---|---|
| Array/list | `list` (dynamic) | `Array` | `ArrayList` / `List` | slice |
| Key-value | `dict` | `Object` / `Map` | `HashMap` | `map` |
| Safe lookup | `.get(k, default)` | `??` / `?.` | `getOrDefault` | two-value assign |
| Ordered map | `dict` (3.7+) | `Map` | `LinkedHashMap` | No |
| Set | `set` | `Set` | `HashSet` | `map[T]struct{}` |

Unlike JS `Object`, Python `dict` is not a prototype chain — it's a pure hash map. Dict views (`keys()`, `values()`, `items()`) are live, reflecting mutations — they're not snapshots.

## The task

Implement three functions:

- `group_by_first_char(words: list[str]) -> dict[str, list[str]]` — groups words by their first character using `defaultdict`; words with the same first character share a list. Empty strings are skipped.
- `zip_to_dict(keys: list[str], values: list) -> dict` — zips two lists into a dict; if lengths differ, truncate to the shorter one (standard `zip` behavior).
- `top_n(scores: dict[str, int], n: int) -> list[str]` — returns the names of the top `n` scorers, sorted descending by score. Ties broken alphabetically.
