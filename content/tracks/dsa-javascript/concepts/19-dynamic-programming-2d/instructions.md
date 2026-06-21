# Dynamic Programming: 2D

## What you'll learn

How to extend DP from a single sequence to two axes — grids and pairs of strings. You'll implement unique paths, longest common subsequence, and edit distance: three problems that cover the full 2D DP pattern space.

## Key concepts

2D DP replaces a 1D array with a 2D table. The key is identifying what the axes represent and what the recurrence says.

### Unique paths — grid navigation

`dp[i][j]` = number of ways to reach cell (i, j) from (0, 0) moving only right or down.

```js
dp[i][j] = dp[i-1][j] + dp[i][j-1]   // came from above or from the left
```

Base case: any cell in the first row or column has exactly 1 path.

```js
function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i-1][j] + dp[i][j-1];
    }
  }
  return dp[m-1][n-1];
}
```

### Longest common subsequence

`dp[i][j]` = LCS length of `s1[0..i-1]` and `s2[0..j-1]`.

```
if s1[i-1] === s2[j-1]:  dp[i][j] = dp[i-1][j-1] + 1
else:                     dp[i][j] = max(dp[i-1][j], dp[i][j-1])
```

```js
function longestCommonSubsequence(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}
```

### Edit distance (Levenshtein)

`dp[i][j]` = minimum edits to transform `s1[0..i-1]` into `s2[0..j-1]`.

```
if s1[i-1] === s2[j-1]:  dp[i][j] = dp[i-1][j-1]       (no op needed)
else:                     dp[i][j] = 1 + min(
                              dp[i-1][j],    // delete from s1
                              dp[i][j-1],    // insert into s1
                              dp[i-1][j-1]   // replace
                          )
```

Base cases: `dp[i][0] = i` (delete all), `dp[0][j] = j` (insert all).

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| uniquePaths | O(m·n) | O(m·n) — reducible to O(n) |
| longestCommonSubsequence | O(m·n) | O(m·n) — reducible to O(n) |
| editDistance | O(m·n) | O(m·n) — reducible to O(n) |

All three can be space-optimized to O(n) by keeping only two rows.

## Common variations

- **Minimum Path Sum** (LC 64) — grid with costs; `dp[i][j] = grid[i][j] + min(above, left)`
- **Coin Change 2** (LC 518) — 2D DP over coin index × amount
- **Longest Palindromic Subsequence** — LCS of `s` and `reverse(s)`
- **Wildcard Matching** (LC 44) — edit distance variant with `*` and `?`

## vs other languages

Python's list comprehension makes the table initialization concise: `dp = [[0]*(n+1) for _ in range(m+1)]`. Java would use `new int[m+1][n+1]`. In JavaScript, `Array.from({ length: m }, () => new Array(n).fill(0))` is the idiomatic pattern — do not use `new Array(m).fill(new Array(n).fill(0))` because all rows share the same array reference.

## FAANG follow-up questions

After uniquePaths:
- "What if there are obstacles?" (LC 63) — if `grid[i][j] === 1`, set `dp[i][j] = 0`.

After longestCommonSubsequence:
- "Can you reconstruct the actual subsequence?" — backtrack from `dp[m][n]`: if chars match, go diagonal; otherwise go in the direction of the larger value.

After editDistance:
- "What's the minimum space?" — only two rows needed: current and previous. O(n).

## Watch out

- **Off-by-one on string DP**: the table is `(m+1) × (n+1)`. `dp[i][j]` corresponds to `s1[i-1]` and `s2[j-1]`.
- **Shared-reference trap**: `new Array(m).fill([])` fills every row with the same array. Always use a generator or `.map(() => new Array(n).fill(0))`.
- **uniquePaths base case**: the entire first row and column are 1. Forgetting this makes the rest of the table wrong.

## The task

### `uniquePaths(m, n)`

Return the number of unique paths from top-left to bottom-right in an m×n grid, moving only right or down.

```js
uniquePaths(3, 7)  // 28
uniquePaths(3, 2)  // 3
uniquePaths(1, 1)  // 1
```

### `longestCommonSubsequence(s1, s2)`

Return the length of the longest common subsequence of two strings.

```js
longestCommonSubsequence("abcde", "ace")   // 3
longestCommonSubsequence("abc", "abc")     // 3
longestCommonSubsequence("abc", "def")     // 0
```

### `editDistance(s1, s2)`

Return the minimum number of single-character operations (insert, delete, replace) to transform `s1` into `s2`.

```js
editDistance("horse", "ros")    // 3
editDistance("intention", "execution")  // 5
editDistance("", "abc")         // 3
```
