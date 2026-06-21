# Dynamic Programming: 2D

## What you'll learn

How to model problems with two independent state dimensions into a 2D DP table, identify the recurrence relation, and fill the table bottom-up. The three classic problems here — unique paths, LCS, and edit distance — each have the same O(m·n) shape but different recurrence structures that you must recognize on sight in an interview.

## Key concepts

2D DP problems define state as `dp[i][j]` = answer to the subproblem involving the first `i` units of one dimension and `j` units of another. The discipline:

1. Define what `dp[i][j]` means.
2. Write the recurrence (the relationship between `dp[i][j]` and smaller subproblems).
3. Establish base cases (row 0, column 0, or empty inputs).
4. Fill in order so that when computing `dp[i][j]`, all referenced cells already exist.

### Unique Paths — grid DP

`dp[i][j]` = number of paths from top-left to cell (i, j) moving only right or down.

Base: first row and first column are all 1 (only one direction is possible).
Recurrence: `dp[i][j] = dp[i-1][j] + dp[i][j-1]`.

```python
def unique_paths(m: int, n: int) -> int:
    dp = [[1] * n for _ in range(m)]   # base case: row 0, col 0 are all 1
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
    return dp[m - 1][n - 1]
```

### Longest Common Subsequence — two-string DP

`dp[i][j]` = length of LCS of `s1[:i]` and `s2[:j]`.

Base: `dp[0][*] = 0` and `dp[*][0] = 0` (empty string has no common subsequence).
Recurrence:
- Characters match: `dp[i][j] = dp[i-1][j-1] + 1`
- Characters differ: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`

```python
def longest_common_subsequence(s1: str, s2: str) -> int:
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # +1 for empty prefix base case
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]
```

Note the index offset: `s1[i-1]` because `dp[i]` corresponds to the first `i` characters (index `i-1`).

### Edit Distance (Levenshtein) — two-string DP with three operations

`dp[i][j]` = minimum edits to transform `s1[:i]` into `s2[:j]`.

Base:
- `dp[i][0] = i` — delete all `i` characters of s1
- `dp[0][j] = j` — insert all `j` characters of s2

Recurrence:
- Characters match: `dp[i][j] = dp[i-1][j-1]` (no operation)
- Characters differ: `dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])`
  - `dp[i-1][j]` = delete from s1
  - `dp[i][j-1]` = insert into s1
  - `dp[i-1][j-1]` = replace

```python
def edit_distance(s1: str, s2: str) -> int:
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # delete
                    dp[i][j - 1],      # insert
                    dp[i - 1][j - 1],  # replace
                )
    return dp[m][n]
```

## Time and space complexity

| Problem | Time | Space (table) | Space (optimized) |
|---------|------|---------------|-------------------|
| Unique paths | O(m·n) | O(m·n) | O(n) rolling row |
| LCS | O(m·n) | O(m·n) | O(n) rolling row |
| Edit distance | O(m·n) | O(m·n) | O(n) rolling row |

Space optimization: since each row depends only on the previous row, you can keep two 1D arrays (`prev` and `curr`) and update in place.

## Common variations

- **Minimum Path Sum** — like unique paths but minimize the sum of grid values. Same recurrence shape; `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`.
- **Longest Palindromic Subsequence** — `LPS(s) = LCS(s, reversed(s))`. Reuse your LCS solution directly.
- **Distinct Subsequences** — count how many ways `s2` appears as a subsequence of `s1`. Recurrence: `dp[i][j] = dp[i-1][j-1] + dp[i-1][j]` when chars match, else `dp[i-1][j]`.
- **Regular Expression Matching** — 2D DP where `dp[i][j]` means pattern `p[:j]` matches text `t[:i]`; the `*` case is the tricky branch.

## vs other languages

Python's `[[0] * n for _ in range(m)]` creates independent rows — this is the correct idiom. `[[0] * n] * m` creates `m` references to the same list; mutating `dp[0][0]` would affect every row. Languages with true 2D arrays (Java, C++) don't have this trap.

`@functools.cache` on a recursive `def dp(i, j)` is a valid alternative to the bottom-up table and can be cleaner for complex recurrences with irregular access patterns. The iterative table is generally faster and avoids Python's recursion overhead.

## Watch out

- **Index offset in string DP** — `dp[i]` corresponds to `s1[i-1]` (0-indexed string, 1-indexed table). Forgetting the `-1` is the most common bug.
- **`[[0] * n] * m` aliasing bug** — all rows are the same list. Always use a comprehension.
- **Edit distance vs LCS** — the recurrences look similar but differ crucially in the "no match" case. LCS takes `max` of two neighbors; edit distance takes `1 + min` of three neighbors.
- **Space-optimized edit distance** — update the current row left to right, but you need to save `dp[i-1][j-1]` (the diagonal) before overwriting it. Use a `prev_diag` variable.
- **Unique paths with obstacles** — if a cell is blocked, set `dp[i][j] = 0` instead of applying the recurrence.

## FAANG follow-up questions

> "Can you reduce `edit_distance` to O(n) space?" — Yes. Process row by row. Before updating `dp[j]`, save the old value (the diagonal `dp[i-1][j-1]`) in a temporary variable. At each step: `new = dp[j-1] + 1` (insert), `old + 1` (delete), `prev_diag + cost` (replace/match). One row is enough.

> "What's the difference between LCS and longest common substring?" — LCS allows gaps (subsequence); common substring must be contiguous. Substring DP: `dp[i][j] = dp[i-1][j-1] + 1` when chars match, else `0`. Answer is the maximum `dp[i][j]` found, not `dp[m][n]`.

> "How would you reconstruct the actual LCS string, not just its length?" — Backtrack through the table: at `dp[m][n]`, if chars matched, take the char and move to `dp[m-1][n-1]`; otherwise move to whichever neighbor is larger. Collect chars in reverse.

## The task

```python
def unique_paths(m: int, n: int) -> int:
    """Count paths from top-left to bottom-right of an m×n grid.
    You can only move right or down."""

def longest_common_subsequence(s1: str, s2: str) -> int:
    """Return the length of the longest common subsequence of s1 and s2.
    A subsequence is not required to be contiguous."""

def edit_distance(s1: str, s2: str) -> int:
    """Return the minimum number of single-character edits (insert, delete,
    replace) to transform s1 into s2."""
```

**Examples:**
- `unique_paths(3, 7)` → `28`
- `unique_paths(1, 1)` → `1`
- `longest_common_subsequence("abcde", "ace")` → `3` (subsequence: a, c, e)
- `longest_common_subsequence("abc", "def")` → `0`
- `edit_distance("horse", "ros")` → `3`
- `edit_distance("intention", "execution")` → `5`
- `edit_distance("", "abc")` → `3`
- `edit_distance("abc", "abc")` → `0`
