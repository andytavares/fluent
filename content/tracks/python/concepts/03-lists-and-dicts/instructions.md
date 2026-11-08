## What you build

You write `group_by_first_char`, `zip_to_dict` and `top_n`. They use the four built-in collection types, `zip` and `defaultdict`. This lesson builds on **Functions**.

## Key concepts

### A `list` is a mutable sequence

`sort()` sorts the list in place. `sorted()` returns a new list. A slice `[start:stop]` copies part of a list, and a negative index counts from the end.

```python
nums = [3, 1, 4, 1, 5]
nums.append(9)
nums.extend([2, 6])
nums.sort()               # in place
sorted_copy = sorted(nums)  # new list
nums[1:3]                 # [1, 2]
nums[-1]                  # 9
```

### A `dict` maps keys to values, in insertion order

A dict keeps insertion order since Python 3.7. It is a plain hash map, with no prototype chain like a JavaScript `Object`. `get()` returns a default for a missing key.

```python
scores = {"alice": 95, "bob": 87}
scores["carol"] = 92
scores.get("dave", 0)  # 0
scores.items()         # dict_items view
scores.keys()
scores.values()
# Merge with unpacking
{**scores, "eve": 88}
# Merge operator: Python 3.9 or later
scores | {"eve": 88}
```

### Dict views are live

`keys()`, `values()` and `items()` return views, not snapshots. A view shows each later change to the dict.

```python
d = {"a": 1}
keys = d.keys()
d["b"] = 2
keys  # dict_keys(['a', 'b'])
```

### A `set` holds unique values

Sets support the operators of set math.

```python
a = {1, 2, 3}
b = {2, 3, 4}
a & b  # intersection: {2, 3}
a | b  # union: {1, 2, 3, 4}
a - b  # difference: {1}
# symmetric difference: {1, 4}
a ^ b
```

### A `tuple` is an immutable sequence

You can unpack a tuple, or any sequence, into names. A starred name collects the rest into a list.

```python
point = (3, 4)
x, y = point
# a = 1, rest = [2, 3, 4]
a, *rest = [1, 2, 3, 4]
```

### `enumerate` counts, and `zip` pairs

`enumerate` gives an index with each item. `zip` pairs items from several iterables by position.

```python
items = ["a", "b", "c"]
for i, val in enumerate(items, start=1):
    print(i, val)  # 1 a, 2 b, 3 c

list(zip([1, 2, 3], ["a", "b", "c"]))
# [(1, 'a'), (2, 'b'), (3, 'c')]
```

### `defaultdict` creates missing values

`collections.defaultdict` calls a factory, such as `list`, the first time you read a missing key.

```python
from collections import defaultdict

groups = defaultdict(list)
for word in ["cat", "car", "dog", "door"]:
    groups[word[0]].append(word)
# {'c': ['cat', 'car'],
#  'd': ['dog', 'door']}
```

## Watch out

- Do not remove items from a list while you loop over it. The indices shift, and the loop skips items.
- To change a list in a loop, loop over a copy (`items[:]`) or build a new list.
- `[[]] * 3` gives one list three times. A change to one sublist changes all three.
- Use `[[] for _ in range(3)]` for three independent lists.
- `d[key]` raises `KeyError` on a missing key. `d.get(key, default)` does not.
- Use `.get()` or `defaultdict` when a missing key is normal, not an error.
- `zip()` stops at the shortest iterable and gives no warning. Use `itertools.zip_longest` to find or pad uneven inputs.

## The task

Write three functions in `stub.py` over the core collection types.

1. `group_by_first_char(words: list[str]) -> dict[str, list[str]]` groups `words` by their first character. Use `defaultdict`.
2. Words with the same first character share one list, in input order.
3. `group_by_first_char` skips empty strings, because they have no first character.
4. `zip_to_dict(keys: list[str], values: list) -> dict` pairs each key with the value at the same index.
5. If the lists have different lengths, `zip_to_dict` stops at the shorter one. This is not an error.
6. `top_n(scores: dict[str, int], n: int) -> list[str]` returns the names of the top `n` scorers.
7. `top_n` sorts by score, highest first. It breaks a tie by name, in alphabetical order.
8. If `n` is the number of entries or more, `top_n` returns all names in that order.

```python
group_by_first_char(["cat", "car", "dog"])
# {'c': ['cat', 'car'], 'd': ['dog']}
group_by_first_char(["a", "ab", "abc"])
# {'a': ['a', 'ab', 'abc']}
group_by_first_char(["", "ant", ""])
# {'a': ['ant']}
group_by_first_char([])  # {}

zip_to_dict(["a", "b", "c"], [1, 2, 3])
# {'a': 1, 'b': 2, 'c': 3}
zip_to_dict(["a", "b", "c"], [1, 2])
# {'a': 1, 'b': 2}
zip_to_dict(["a"], [1, 2, 3])  # {'a': 1}
zip_to_dict([], [])            # {}

top_n({"alice": 95, "bob": 87,
       "carol": 92}, 2)
# ['alice', 'carol']
top_n({"alice": 95, "bob": 87}, 2)
# ['alice', 'bob']
top_n({"zara": 90, "alice": 90,
       "bob": 80}, 2)
# ['alice', 'zara']
top_n({"alice": 95, "bob": 99}, 1)
# ['bob']
top_n({}, 3)  # []
```
