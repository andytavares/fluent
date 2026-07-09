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

## Watch out

- Never mutate a list while iterating over it — `for x in items: items.remove(x)` skips elements because the indices shift under you. Iterate over `items[:]` (a copy) or build a new list instead.
- `[[]] * 3` does **not** create three independent lists — it creates one list, referenced three times. Mutating one sublist mutates all of them. Use `[[] for _ in range(3)]` instead.
- `dict[key]` raises `KeyError` on a missing key; `dict.get(key, default)` doesn't. Reach for `.get()` (or `defaultdict`) whenever a missing key is an expected case, not an error.
- `zip()` silently truncates to the shortest iterable — a length mismatch produces no warning. Use `itertools.zip_longest` if you need to detect or pad uneven inputs.

## The task

Implement three functions over Python's core collection types.

**`group_by_first_char(words: list[str]) -> dict[str, list[str]]`** — groups `words` by their first character, using `defaultdict`. Words with the same first character share a list, in the order they appeared in the input. Empty strings are skipped entirely (they have no first character to key on).

```python
group_by_first_char(["cat", "car", "dog", "door", "ant"])
# {'c': ['cat', 'car'], 'd': ['dog', 'door'], 'a': ['ant']}

group_by_first_char(["", "ant", ""])
# {'a': ['ant']}    — empty strings skipped

group_by_first_char([])
# {}
```

**`zip_to_dict(keys: list[str], values: list) -> dict`** — zips `keys` and `values` together into a dict, pairing each key with the value at the same index. If the two lists have different lengths, stop at the shorter one — this is standard `zip` truncation behavior, not an error.

```python
zip_to_dict(["a", "b", "c"], [1, 2, 3])   # {'a': 1, 'b': 2, 'c': 3}
zip_to_dict(["a", "b", "c"], [1, 2])      # {'a': 1, 'b': 2}       — keys truncated
zip_to_dict(["a"], [1, 2, 3])             # {'a': 1}                — values truncated
zip_to_dict([], [])                        # {}
```

**`top_n(scores: dict[str, int], n: int) -> list[str]`** — returns the names (keys) of the top `n` scorers, sorted descending by score. Ties are broken alphabetically by name. If `n` is greater than or equal to the number of entries, returns all names sorted the same way.

```python
top_n({"alice": 95, "bob": 87, "carol": 92}, 2)   # ['alice', 'carol']
top_n({"alice": 95, "bob": 87}, 2)                 # ['alice', 'bob']  — n == size
top_n({"zara": 90, "alice": 90, "bob": 80}, 2)     # ['alice', 'zara'] — tie broken alphabetically
top_n({"alice": 95, "bob": 99}, 1)                  # ['bob']
top_n({}, 3)                                        # []
```
