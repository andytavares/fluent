# Backtracking

## What you'll learn

How to systematically explore a solution space by building candidates incrementally and abandoning a branch the moment it can't lead to a valid solution. You'll implement subsets, permutations, and combination sum — the three canonical backtracking shapes.

## Key concepts

Backtracking is DFS on a decision tree. At each node: **choose** an option, **explore** its consequences, **unchoose** (undo the choice) before trying the next option. The undo step is what makes backtracking distinct from plain DFS.

```
function backtrack(state):
  if base case:
    record result and return
  for each valid choice:
    make choice
    backtrack(updated state)
    undo choice          // <-- this is the backtrack
```

### Subsets — record at every node

```js
function subsets(nums) {
  const result = [];
  function bt(start, curr) {
    result.push([...curr]); // snapshot (include current subset at every node)
    for (let i = start; i < nums.length; i++) {
      curr.push(nums[i]);
      bt(i + 1, curr);
      curr.pop();          // backtrack
    }
  }
  bt(0, []);
  return result;
}
```

### Permutations — choose from remaining elements

```js
function permutations(nums) {
  const result = [];
  function bt(remaining, curr) {
    if (!remaining.length) { result.push([...curr]); return; }
    for (let i = 0; i < remaining.length; i++) {
      curr.push(remaining[i]);
      bt([...remaining.slice(0, i), ...remaining.slice(i + 1)], curr);
      curr.pop();
    }
  }
  bt(nums, []);
  return result;
}
```

### Combination sum — pass `i` not `i+1` for reuse; prune with sorted candidates

```js
function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];
  function bt(start, remaining, curr) {
    if (remaining === 0) { result.push([...curr]); return; }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break; // pruning
      curr.push(candidates[i]);
      bt(i, remaining - candidates[i], curr); // i not i+1: reuse allowed
      curr.pop();
    }
  }
  bt(0, target, []);
  return result;
}
```

## Time and space complexity

| Problem | Time | Space (call depth) |
|---------|------|-------------------|
| subsets | O(n * 2^n) | O(n) |
| permutations | O(n * n!) | O(n) |
| combinationSum | O(n^(t/m)) worst case | O(t/m) |

`t` = target, `m` = smallest candidate.

## Common variations

- **Subsets II** (LC 90) — duplicates in input; sort + skip `nums[i] === nums[i-1]` at same depth
- **Permutations II** (LC 47) — duplicates; frequency-map approach
- **Combination Sum II** (LC 40) — each number used once; `bt(i+1, ...)` + skip duplicates
- **N-Queens** (LC 51) — validate row/column/diagonal on each queen placement; prune invalid rows

## vs other languages

Python `yield` enables lazy generators. JavaScript collects eagerly. For very large result sets (e.g., all permutations of 12 elements), generators are more memory-efficient, but the backtracking logic is identical.

## FAANG follow-up questions

After subsets:
- "What if input has duplicates?" (Subsets II — sort + at each recursion level, skip if `nums[i] === nums[i-1]` and i > start)
- "How many subsets does an array of n distinct elements have?" (2^n)

After permutations:
- "Can you do this in-place without creating new arrays for `remaining`?" (swap-based: swap `nums[start]` with `nums[i]`, recurse `start+1`, swap back)
- "What if elements can repeat?" (use a frequency map; decrement before recursing, increment after)

After combinationSum:
- "What if each candidate can only be used once?" (change `bt(i, ...)` to `bt(i+1, ...)` — Combination Sum II)
- "What if you just need the count of combinations, not the combinations themselves?" (DP is better: `dp[amount]` = number of ways; O(amount * candidates) vs exponential backtracking)

## Watch out

- **Snapshot on push**: `result.push([...curr])` not `result.push(curr)`. Without the spread, all entries point to the same array and will all be empty at the end.
- **combinationSum pruning**: `break` only works if candidates are sorted. Without sorting, use `continue` — but you lose the early-exit optimization.
- **combinationSum reuse**: `bt(i, ...)` (same index) allows reusing the current candidate. `bt(i+1, ...)` would produce wrong results (no reuse).
- **permutations vs subsets**: subsets record at every node; permutations record only at leaves (when all elements are chosen).

## The task

### `subsets(nums)`

Return all possible subsets (the power set). No duplicates in `nums`.

```js
subsets([1, 2, 3]) // [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]] (any order)
subsets([0])       // [[], [0]]
```

### `permutations(nums)`

Return all permutations. All elements in `nums` are unique.

```js
permutations([1, 2, 3]) // all 6 orderings in any order
permutations([1])       // [[1]]
```

### `combinationSum(candidates, target)`

Return all unique combinations that sum to `target`. Each candidate may be used unlimited times.

```js
combinationSum([2, 3, 6, 7], 7) // [[2,2,3],[7]]
combinationSum([2, 3, 5], 8)    // [[2,2,2,2],[2,3,3],[3,5]]
combinationSum([2], 1)          // []
```
