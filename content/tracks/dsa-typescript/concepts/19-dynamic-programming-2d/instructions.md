# Dynamic Programming: 2D

## What you'll learn

How to set up a 2D DP table, derive recurrences from two sequences or a grid, and avoid the classic off-by-one mistakes that come from 0-indexed strings vs 1-indexed DP rows. You'll implement `uniquePaths`, `longestCommonSubsequence`, and `editDistance` — three patterns that cover the full range of 2D DP problems at FAANG.

## Key concepts

### The framework (same as 1D, one dimension wider)

1. **Define `dp[i][j]` precisely** — in terms of a subproblem involving a prefix of size `i` and `j`.
2. **Write the recurrence** — how `dp[i][j]` depends on smaller subproblems.
3. **Handle base cases** — typically the entire first row and/or first column.
4. **Fill in order** — top-left to bottom-right for the problems below.

### Grid paths — Unique Paths

`dp[i][j]` = number of distinct paths from `(0, 0)` to `(i, j)` moving only right or down.

```typescript
function uniquePaths(m: number, n: number): number {
  // Fill the entire table with 1 — first row and column each have exactly 1 path
  const dp = Array.from({ length: m }, () => new Array<number>(n).fill(1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      // Can arrive from above or from the left
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }
  return dp[m - 1][n - 1];
}
// uniquePaths(3, 7) → 28   uniquePaths(3, 2) → 3
```

Time: O(m·n) | Space: O(m·n), reducible to a single row O(n) by updating in place.

### Sequence comparison — Longest Common Subsequence

`dp[i][j]` = length of the LCS of `s1[0..i-1]` and `s2[0..j-1]`. The 1-indexed DP rows avoid a messy -1 offset when checking characters.

```typescript
function longestCommonSubsequence(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  // dp is (m+1) × (n+1); row 0 and col 0 are 0 (empty-string base cases)
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1; // extend the common subsequence
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // skip one char from either
      }
    }
  }
  return dp[m][n];
}
// longestCommonSubsequence("abcde", "ace") → 3 ("ace")
// longestCommonSubsequence("abc", "def")   → 0
```

Time: O(m·n) | Space: O(m·n)

### Edit Distance (Levenshtein)

`dp[i][j]` = minimum number of single-character edits (insert, delete, replace) to convert `s1[0..i-1]` into `s2[0..j-1]`.

```typescript
function editDistance(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));

  // Base cases: convert prefix of s1 to empty string (delete i chars)
  //             convert empty string to prefix of s2 (insert j chars)
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // characters match: no edit needed
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // delete s1[i-1]
          dp[i][j - 1],     // insert s2[j-1] into s1
          dp[i - 1][j - 1]  // replace s1[i-1] with s2[j-1]
        );
      }
    }
  }
  return dp[m][n];
}
// editDistance("horse", "ros")         → 3
// editDistance("intention", "execution") → 5
```

Time: O(m·n) | Space: O(m·n)

## Complexity comparison

| Problem | Naive | 2D DP | Space-optimized |
|---------|-------|-------|----------------|
| Unique Paths | O(2^(m+n)) | O(m·n) | O(n) single row |
| LCS | O(2^min(m,n)) | O(m·n) | O(min(m,n)) two rows |
| Edit Distance | O(3^max(m,n)) | O(m·n) | O(min(m,n)) two rows |

## Common variations

- **Unique Paths II** (LeetCode 63) — same grid DP but cells with obstacles are forced to 0; process those before the interior loop
- **Longest Palindromic Subsequence** — `lps(s) = lcs(s, reverse(s))`; same recurrence, new framing
- **Wildcard Matching / Regex Matching** (LeetCode 44/10) — edit-distance-like DP with `*` and `?` operators; the `*` case adds a third branch: `dp[i][j] = dp[i][j-1]` (match zero) or `dp[i-1][j]` (match one more)
- **Distinct Subsequences** (LeetCode 115) — count how many times `t` appears as a subsequence of `s`; similar to LCS but you only move in one direction on a match

## vs other languages

2D DP is language-agnostic in logic, but TypeScript has two common pitfalls:

- **Array initialization**: `new Array(n).fill([])` shares the *same* inner array across all rows. Always use `Array.from({ length: m }, () => new Array<number>(n).fill(0))`.
- **Typed DP tables**: Declaring `const dp: number[][]` up front and filling it with `Array.from` is cleaner than building up with `push`. TypeScript's strict mode will catch `dp[i][j]` access on an uninitialized row if you use `number[][] | undefined[][]`.

## Watch out

- **Off-by-one**: LCS and edit distance use a `(m+1) × (n+1)` table so that row 0 and column 0 cleanly represent the empty-string base case. `s1[i-1]` accesses the actual character — the DP index is one ahead of the string index.
- **`uniquePaths` base case**: Initializing the entire table to `1` works because every cell in the first row and first column genuinely has exactly 1 path. In Unique Paths II (with obstacles), you cannot do this — obstacles in the first row must break the chain of 1s.
- **Edit distance operations are symmetric**: `dp[i-1][j]` is *delete from s1*, `dp[i][j-1]` is *insert into s1*. Mixing up which is which doesn't change the answer (the minimum of three is still correct), but interviewers will ask you to identify them.
- **Space optimization**: You can reduce LCS and edit distance to O(min(m,n)) by keeping only the previous row. The trick is to save `dp[i-1][j-1]` in a variable before overwriting `dp[j]`. Interviewers commonly ask for this follow-up.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "Can you reduce the space to O(n)?" (Yes — keep only the previous row and a scalar for the diagonal. Show `prev = dp[j]` before the overwrite.)
> - "How would you reconstruct the actual LCS, not just its length?" (Backtrack through the DP table: when `s1[i-1] === s2[j-1]` you came from diagonal; otherwise from whichever of `dp[i-1][j]` or `dp[i][j-1]` is larger.)
> - "Edit distance only allows insert/delete. What if replace is not allowed?" (Remove the `dp[i-1][j-1]` branch — now it's the number of insertions and deletions to make the strings equal, which equals `m + n - 2 * lcs(s1, s2)`.)
> - "Unique Paths is combinatorics. What's the closed-form solution?" (`C(m+n-2, m-1)` — the number of ways to choose which `m-1` of the `m+n-2` steps go downward. O(1) if you compute it with Pascal's identity or logarithms to avoid overflow.)

## The task

```typescript
// Count paths from top-left to bottom-right in an m×n grid.
// You can only move right or down.
// uniquePaths(3, 7) → 28
// uniquePaths(3, 2) → 3
function uniquePaths(m: number, n: number): number

// Return the length of the longest common subsequence of s1 and s2.
// A subsequence need not be contiguous.
// s1="abcde", s2="ace" → 3  ("ace")
// s1="abc", s2="def"   → 0
function longestCommonSubsequence(s1: string, s2: string): number

// Return the minimum number of single-character edits (insert, delete, replace)
// to transform s1 into s2.
// s1="horse", s2="ros"         → 3
// s1="intention", s2="execution" → 5
function editDistance(s1: string, s2: string): number
```

For each: define your `dp` table precisely, fill the base cases explicitly, then fill interior cells using the recurrence. A clean table definition prevents off-by-one errors.
