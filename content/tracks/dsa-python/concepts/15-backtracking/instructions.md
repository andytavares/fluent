# Backtracking

## What you'll learn

The universal backtracking template, why `current[:]` (not `current`) is the snapshot you need, and how pruning transforms exponential search into something tractable — demonstrated through subsets, permutations, and combination sum.

## Key concepts

Backtracking is DFS on an implicit decision tree. At each node you choose an option, recurse, then undo the choice (backtrack). You prune branches that can never lead to a valid solution.

```python
def backtrack(state, choices):
    if is_complete(state):
        results.append(state[:])   # SNAPSHOT — not a reference
        return
    for choice in choices:
        state.append(choice)       # choose
        backtrack(state, ...)      # explore
        state.pop()                # unchoose
```

### Subsets — every prefix is a valid subset

```python
def subsets(nums: list[int]) -> list[list[int]]:
    result: list[list[int]] = []

    def backtrack(start: int, current: list[int]) -> None:
        result.append(current[:])        # append at every node, not just leaves
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    return result
```

### Permutations — pick any unused element

```python
def permutations(nums: list[int]) -> list[list[int]]:
    result: list[list[int]] = []

    def backtrack(current: list[int], remaining: list[int]) -> None:
        if not remaining:
            result.append(current[:])
            return
        for i in range(len(remaining)):
            current.append(remaining[i])
            backtrack(current, remaining[:i] + remaining[i + 1:])
            current.pop()

    backtrack([], nums)
    return result
```

### Combination Sum — reuse candidates, prune on excess

```python
def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    result: list[list[int]] = []
    candidates.sort()                        # enables early break

    def backtrack(start: int, current: list[int], remaining: int) -> None:
        if remaining == 0:
            result.append(current[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break                        # sorted: rest are also too large
            current.append(candidates[i])
            backtrack(i, current, remaining - candidates[i])  # i, not i+1: reuse ok
            current.pop()

    backtrack(0, [], target)
    return result
```

**Key difference from subsets:** pass `i` (not `i+1`) when recursing — the same candidate can be reused.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Subsets of n elements | O(2^n) | O(n) call depth |
| Permutations of n elements | O(n · n!) | O(n) call depth |
| Combination sum (target t, min m) | O(n^(t/m)) | O(t/m) depth |

## Common variations

- **Subsets II** (with duplicates in input) — sort first; skip `nums[i] == nums[i-1]` at the same level
- **Permutations II** (with duplicates) — sort, use a `used[]` boolean array, skip when `nums[i] == nums[i-1] and not used[i-1]`
- **N-Queens** — backtrack with column/diagonal sets to prune invalid placements
- **Word Search** — backtrack on a 2D grid, mark visited, unmark on backtrack

## vs other languages

Python's `current[:]` slice creates a shallow copy in O(n). In Java you'd use `new ArrayList<>(current)`. In C++ `std::vector<int>(current)`. The Python idiom is concise.

**Mutable default argument trap:** never use `def backtrack(current=[])` — Python evaluates the default once and reuses it across calls. Always initialize mutable state inside the function or use `None` as default and initialize inside.

## Watch out

- **`result.append(current[:])` not `result.append(current)`** — if you append the list reference, all entries in `result` will be the same (eventually empty) list after backtracking completes.
- **Shallow copy is sufficient for 1D backtracking** — `current[:]` copies the list. For nested structures (2D boards), use `copy.deepcopy`.
- **`combination_sum` passes `i` not `i+1`** when reuse is allowed. Passing `i+1` would produce combinations without reuse (Combination Sum II).
- **Sorting before `combination_sum` is required for the `break` to work.** Without sort, you can't terminate early.
- **Pruning is correctness, not just optimization** — removing `break` in combination sum doesn't change the result, but removing `start` (restarting from 0 each time) would produce duplicate combinations.

## FAANG follow-up questions

> "How do you handle duplicates in the input for subsets?" — Sort first, then in the backtracking loop: `if i > start and nums[i] == nums[i-1]: continue`. This skips duplicate choices at the same decision level.

> "What's the difference between `combination_sum` (reuse) and `combination_sum II` (no reuse, duplicates in input)?" — In CS II: pass `i+1` (no reuse), sort input, and skip `candidates[i] == candidates[i-1]` at same level.

> "Can you solve N-Queens with backtracking?" — Yes: place one queen per row, track occupied columns and diagonals using sets. Prune when a conflict is detected. O(n!) time.

## The task

```python
def subsets(nums: list[int]) -> list[list[int]]:
    """Return all possible subsets (the power set). nums has no duplicates.
    The result can be in any order."""

def permutations(nums: list[int]) -> list[list[int]]:
    """Return all permutations of nums. nums has no duplicates.
    The result can be in any order."""

def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    """Return all unique combinations of candidates that sum to target.
    Candidates are distinct; each number may be used unlimited times."""
```

**Examples:**
- `subsets([1,2,3])` → 8 subsets including `[]` and `[1,2,3]` (any order)
- `permutations([1,2,3])` → all 6 permutations (any order)
- `combination_sum([2,3,6,7], 7)` → `[[2,2,3],[7]]`
- `combination_sum([2,3,5], 8)` → `[[2,2,2,2],[2,3,3],[3,5]]`
- `combination_sum([2], 1)` → `[]`
