# Backtracking

## What you'll learn

How to enumerate all valid solutions by building candidates incrementally and abandoning them the moment they can't lead to a solution ("pruning"). The template is always: choose → explore → unchoose. You'll implement subsets (power set), permutations, and combination sum.

## Key concepts

### The backtracking template

```typescript
function backtrack(current: T[], /* other state */): void {
  if (isComplete(current)) {
    result.push([...current]); // CRITICAL: spread to clone, not reference
    return;
  }
  for (const choice of availableChoices()) {
    current.push(choice);   // choose
    backtrack(current, ...); // explore
    current.pop();           // unchoose (undo the choice)
  }
}
```

**The clone trap**: `result.push(current)` stores a reference to the mutable array. All stored results will reflect the same empty array at the end. Always use `[...current]` or `current.slice()`.

### Subsets — include-or-exclude with start index

Each element either appears in a subset or it doesn't. By passing a `start` index, you avoid generating duplicate subsets (e.g., both `[1,2]` and `[2,1]`).

```typescript
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[]): void {
    result.push([...current]); // every prefix is a valid subset (including [])
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}
// Output: 2^n subsets
```

### Permutations — used-array tracking

For permutations, every element must appear exactly once. Track which elements are in the current path with a `used` boolean array.

```typescript
function permutations(nums: number[]): number[][] {
  const result: number[][] = [];
  const used = new Array<boolean>(nums.length).fill(false);

  function backtrack(current: number[]): void {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}
// Output: n! permutations
```

### Combination Sum — allow reuse, prune early

Same candidate can be used multiple times. Pass `i` (not `i + 1`) in the recursive call to allow reuse. Prune when `remaining < 0`.

```typescript
function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[], remaining: number): void {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) continue; // prune
      current.push(candidates[i]);
      backtrack(i, current, remaining - candidates[i]); // i, not i+1 = allow reuse
      current.pop();
    }
  }

  backtrack(0, [], target);
  return result;
}
```

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `subsets` | O(n · 2^n) | O(n) | 2^n subsets, each takes O(n) to copy |
| `permutations` | O(n · n!) | O(n) | n! permutations, O(n) each |
| `combinationSum` | O(n^(T/min)) | O(T/min) | T = target, min = smallest coin |

## Common variations

- **Subsets with duplicates** — sort first; skip `nums[i] === nums[i-1]` when `i > start`
- **Permutations with duplicates** — sort first; skip `nums[i] === nums[i-1] && !used[i-1]`
- **N-Queens** — place queens column by column; check row, diagonal, anti-diagonal conflicts
- **Sudoku solver** — try 1-9 for each empty cell; backtrack when a violation occurs
- **Word search** — DFS on a grid with a visited mask; match characters along the path

## vs DP

When the question asks "how many ways" or "minimum cost", DP avoids re-exploring the same subproblem. When the question asks for all solutions (or their enumeration), backtracking is required — DP can count but cannot reconstruct all paths. The rule of thumb: "generate all" → backtracking; "count/optimize" → DP.

## Watch out

- **`[...current]` vs `current`**: storing `current` directly means every entry in `result` points to the same array. This is the single most common backtracking bug. TypeScript's type system doesn't help here — it's a runtime reference issue.
- **`i` vs `i + 1` in combinationSum recursive call**: `i` allows reusing the same element. `i + 1` produces combination subsets where each element is used at most once. Know which your problem requires.
- **Pruning `candidates[i] > remaining`**: sorting candidates first enables an early break: once `candidates[i] > remaining`, all subsequent candidates are also larger, so you can `break` instead of `continue`.
- **`used[i] = false`** in permutations: the unchoose step must reset `used[i]` after `current.pop()`. Forgetting this means subsequent iterations incorrectly see elements as used.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you handle duplicate elements in `subsets`?" (Sort first. In the loop, skip `nums[i] === nums[i - 1]` when `i > start` — you've already explored all subsets starting with `nums[i-1]`.)
> - "Can you generate subsets iteratively (without recursion)?" (Yes — start with `[[]]`, then for each number, append it to every existing subset and add the results. Same O(n·2^n) time.)
> - "How would you solve N-Queens?" (Backtrack column by column. Track attacked rows, diagonals, and anti-diagonals. At each column, try each non-attacked row. O(n!) but with heavy pruning in practice.)
> - "What's the difference between combinations and permutations?" (Combinations: order doesn't matter, use a `start` index. Permutations: order matters, use a `used` array. A combination `[1,2]` and `[2,1]` are the same; as permutations, they're different.)

## The task

Implement three functions:

```typescript
// Return all subsets (the power set) of nums. No duplicate elements in input.
// Order of subsets and elements within subsets does not matter.
// [1,2,3] → 8 subsets including [] and [1,2,3]
function subsets(nums: number[]): number[][]

// Return all permutations of the distinct integers in nums.
// [1,2,3] → 6 permutations (any order)
function permutations(nums: number[]): number[][]

// Return all unique combinations of candidates that sum to target.
// The same candidate may be used multiple times. Output order doesn't matter.
// candidates=[2,3,6,7], target=7 → [[2,2,3],[7]]
// candidates=[2,3], target=6    → [[2,2,2],[3,3]]
function combinationSum(candidates: number[], target: number): number[][]
```
