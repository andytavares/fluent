# Backtracking

## What you'll learn

How to systematically explore all possible choices by building a decision tree, collecting valid complete paths, and pruning subtrees that can't lead to valid solutions. Backtracking is the pattern behind every "generate all X" problem.

## Key concepts

The template is always the same: choose, recurse, unchoose.

```
backtrack(state):
    if base case: record result; return
    for each valid next choice:
        make choice
        backtrack(updated state)
        undo choice   ← this is the "backtrack" step
```

### Pattern 1 — Subsets (include/exclude)

Add a snapshot of `current` at every node (not just leaves), then explore including and excluding each element.

```java
private static void subsetsHelper(int[] nums, int start, List<Integer> current,
                                   List<List<Integer>> result) {
    result.add(new ArrayList<>(current)); // snapshot at every recursive call
    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);
        subsetsHelper(nums, i + 1, current, result);
        current.remove(current.size() - 1); // unchoose
    }
}
```

### Pattern 2 — Permutations (in-place swap)

Fix the element at `start` position by swapping it with each subsequent element. Restore by swapping back.

```java
private static void permuteHelper(int[] nums, int start, List<List<Integer>> result) {
    if (start == nums.length) {
        var perm = new ArrayList<Integer>();
        for (int n : nums) perm.add(n);
        result.add(perm);
        return;
    }
    for (int i = start; i < nums.length; i++) {
        swap(nums, start, i);
        permuteHelper(nums, start + 1, result);
        swap(nums, start, i); // restore original order
    }
}
```

### Pattern 3 — Combination sum (reuse allowed, prune early)

Pass `start = i` (not `i+1`) to allow reusing the same candidate. Sort candidates so you can `break` early when a candidate exceeds the remaining target.

```java
private static void combinationSumHelper(int[] candidates, int target, int start,
                                          List<Integer> current, List<List<Integer>> result) {
    if (target == 0) { result.add(new ArrayList<>(current)); return; }
    for (int i = start; i < candidates.length; i++) {
        if (candidates[i] > target) break; // pruning — candidates is sorted
        current.add(candidates[i]);
        combinationSumHelper(candidates, target - candidates[i], i, current, result);
        current.remove(current.size() - 1);
    }
}
```

## Time and space complexity

| Problem | Time | Space (stack depth) | Why |
|---------|------|---------------------|-----|
| `subsets` | O(2^n) | O(n) | 2 choices per element |
| `permutations` | O(n · n!) | O(n) | n! permutations, each takes O(n) to copy |
| `combinationSum` | O(2^(T/m)) | O(T/m) | T = target; m = min candidate |

Pruning reduces practical runtime significantly — the theoretical worst case is rarely hit.

## Common variations this pattern solves

1. **Subsets II (with duplicates)** — sort input; skip duplicate elements at the same recursion level
2. **Permutations II (with duplicates)** — sort; skip if `nums[i] == nums[i-1]` and `i > start`
3. **N-Queens** — backtrack grid positions; prune with column/diagonal conflict checks
4. **Word Search** — backtrack grid cells with 4-directional DFS; mark visited in-place

## vs dynamic programming

Backtracking generates all solutions; DP finds the optimal single solution. Coin Change asks for the minimum count (DP). Combination Sum asks for all combinations (backtracking). If the problem says "generate all" or "return all", use backtracking. If it says "minimum/maximum/count", consider DP first.

## Watch out

- **Snapshot, don't reference**: `result.add(new ArrayList<>(current))` — adding `current` directly stores a reference. Future `current.remove(...)` calls will corrupt previously added sublists.
- **`remove(size - 1)` not `remove(value)`**: `current.remove(current.size() - 1)` removes the last element by index — O(1). `current.remove(Integer.valueOf(x))` removes by value — O(n) and wrong if duplicates exist.
- **Sort before combinationSum**: the `break` pruning only works if candidates are sorted. Unsorted input may skip valid combinations.
- **`i` vs `i+1` in recursive call for combinations**: `combinationSum` passes `i` (allows reuse of same element). `subsets` passes `i+1` (each element used at most once). Mixing these up is the most common combinatorics bug.

## FAANG follow-up questions

> "How do you handle duplicates in subsets?" — Sort the input; in the for loop, skip if `i > start && nums[i] == nums[i-1]`. This prevents generating duplicate subsets at the same tree level.
>
> "Can you generate permutations iteratively?" — Yes: start with a single-element list; for each new element, insert it at every possible position in existing permutations. But recursive swap is cleaner.
>
> "What's the pruning gain in combinationSum?" — Without pruning, you explore all 2^n subsets. With sorted candidates and early `break`, subtrees where `candidates[i] > remaining_target` are entirely skipped.
>
> "How does word search differ from regular backtracking?" — The grid is the state space; you mark visited cells in-place (`grid[r][c] = '#'`) and restore them after backtracking (`grid[r][c] = original`). This acts as the visited set without extra space.

## The task

Implement three methods in `Solution`:

```java
// Returns all possible subsets (the power set). Order does not matter.
// [1,2,3] -> [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]] (any order)
public static List<List<Integer>> subsets(int[] nums)

// Returns all permutations of nums (no duplicate values in nums).
// [1,2,3] -> [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]] (any order)
public static List<List<Integer>> permutations(int[] nums)

// Returns all unique combinations of candidates that sum to target.
// Each candidate may be reused unlimited times.
// [2,3,6,7], target=7 -> [[2,2,3],[7]]
public static List<List<Integer>> combinationSum(int[] candidates, int target)
```
