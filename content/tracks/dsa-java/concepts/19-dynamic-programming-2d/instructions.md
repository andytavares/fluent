# Dynamic Programming: 2D

## What you'll learn

How to extend 1D DP to problems defined by two indices — two strings, two sequences, or a grid position. You'll implement the three canonical 2D DP problems that appear in nearly every FAANG loop: grid path counting, longest common subsequence, and edit distance.

## Key concepts

### The shape of a 2D DP problem

`dp[i][j]` stores the answer to the subproblem defined by the first `i` items of one dimension and first `j` items of another. Recurrences fill the matrix row by row; each cell depends only on cells above, to the left, or diagonally above-left.

### Unique paths — grid DP

Only right and down moves allowed. The base cases are the entire top row and left column (only one path to each). Every interior cell is the sum of the cell above and the cell to the left.

```java
public static int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int i = 0; i < m; i++) dp[i][0] = 1; // only one way down column 0
    for (int j = 0; j < n; j++) dp[0][j] = 1; // only one way across row 0
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
    return dp[m-1][n-1];
}
```

### Longest Common Subsequence

Allocate `dp[m+1][n+1]` — the `+1` provides a zero-initialized base case for both empty strings. When characters match, extend the LCS by one from the diagonal. When they don't, carry forward the best of skipping either character.

```java
public static int longestCommonSubsequence(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[][] dp = new int[m+1][n+1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1.charAt(i-1) == s2.charAt(j-1)) {
                dp[i][j] = dp[i-1][j-1] + 1;       // characters match
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]); // skip one
            }
        }
    }
    return dp[m][n];
}
```

### Edit Distance (Levenshtein)

Three operations: replace (`dp[i-1][j-1] + 1`), delete from s1 (`dp[i-1][j] + 1`), insert into s1 (`dp[i][j-1] + 1`). Base cases: `dp[i][0] = i` (delete all of s1), `dp[0][j] = j` (insert all of s2).

```java
public static int editDistance(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[][] dp = new int[m+1][n+1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1.charAt(i-1) == s2.charAt(j-1)) {
                dp[i][j] = dp[i-1][j-1];                        // free match
            } else {
                dp[i][j] = 1 + Math.min(dp[i-1][j-1],          // replace
                                Math.min(dp[i-1][j],            // delete
                                         dp[i][j-1]));          // insert
            }
        }
    }
    return dp[m][n];
}
```

## Time and space complexity

| Problem | Time | Space (full table) | Space (optimized) |
|---|---|---|---|
| `uniquePaths` | O(m·n) | O(m·n) | O(n) — rolling row |
| `longestCommonSubsequence` | O(m·n) | O(m·n) | O(min(m,n)) — two rows |
| `editDistance` | O(m·n) | O(m·n) | O(min(m,n)) — two rows |

For `editDistance` space optimization: each row only looks at the previous row and the current cell's left neighbor. Keep two 1D arrays and swap them each iteration.

## Common variations this pattern solves

1. **Unique Paths II** (with obstacles) — same recurrence but `dp[i][j] = 0` when `grid[i][j] == 1`
2. **Minimum Path Sum** — replace sum with min, `dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1])`
3. **Distinct Subsequences** — count ways `s` appears as subsequence in `t`: match adds `dp[i-1][j-1]`, always carry `dp[i-1][j]`
4. **Longest Palindromic Subsequence** — `lcs(s, reverse(s))`; or direct 2D DP over `dp[i][j]` = LPS of `s[i..j]`
5. **Interleaving String** — `dp[i][j]` = true if `s1[0..i-1] + s2[0..j-1]` can interleave to form `s3[0..i+j-1]`
6. **Regular Expression Matching** — the hardest variant; `*` requires checking `dp[i][j-2]` (zero occurrences) or `dp[i-1][j]` (one more occurrence)

## vs 1D DP

1D DP subproblems are defined by a single index (position in an array, amount of money, number of stairs). 2D DP subproblems need two indices — one dimension per independent parameter. The mental jump is recognizing that when a problem involves two sequences or a 2D grid, you likely need a 2D table.

The optimization pattern is the same as 1D DP: notice which previous rows/columns you actually access, and shrink the table to just those rows.

## Watch out

- **Indexing confusion**: `dp[i][j]` in LCS/edit-distance represents the first `i` characters of `s1`, so `s1.charAt(i-1)` maps it back to the 0-indexed string. Getting this wrong produces off-by-one errors that only show up on non-trivial inputs.
- **Forgetting base case initialization**: `new int[m+1][n+1]` zero-initializes in Java — but edit distance needs `dp[i][0] = i` and `dp[0][j] = j` explicitly. Skipping this produces wrong results for strings of different lengths.
- **LCS vs Longest Common Substring**: LCS allows gaps (subsequence); Longest Common Substring requires contiguous characters. The substring recurrence resets to 0 on mismatch instead of taking the max.
- **Space optimization gotcha**: when doing the rolling-array trick for edit distance, you must save `dp[i-1][j-1]` (the diagonal) before overwriting it. Process left to right and save the previous diagonal value before each update.

## FAANG follow-up questions

> "Can you do `uniquePaths` in O(1) space and O(1) time?" — Yes, it's C(m+n-2, m-1) by combinatorics. The DP approach is usually expected in interviews to demonstrate the pattern, but the math shortcut is worth mentioning.
>
> "Can you reconstruct the actual LCS string, not just its length?" — Backtrack through the DP table: start at `dp[m][n]`, if characters matched move diagonally and collect the character; otherwise move toward the larger of `dp[i-1][j]` and `dp[i][j-1]`.
>
> "What if the strings have lengths up to 10^4?" — O(m·n) = O(10^8) operations is borderline. Mention the two-row space optimization and discuss whether there's a smarter approach. For LCS specifically, the Hunt-Szymanski algorithm runs in O((r+n) log n) where r is the number of matches.
>
> "How does edit distance relate to DNA sequence alignment?" — It's the Smith-Waterman / Needleman-Wunsch basis. Bioinformatics uses scoring matrices instead of unit costs, but the DP structure is identical.

## The task

Implement three methods in `Solution`:

```java
// Returns the number of unique paths from top-left to bottom-right of an m×n grid.
// You can only move right or down.
// uniquePaths(3, 7) -> 28
public static int uniquePaths(int m, int n)

// Returns the length of the longest common subsequence of s1 and s2.
// A subsequence does not need to be contiguous.
// longestCommonSubsequence("abcde", "ace") -> 3  ("ace")
public static int longestCommonSubsequence(String s1, String s2)

// Returns the minimum number of edit operations (insert, delete, replace)
// needed to transform s1 into s2.
// editDistance("horse", "ros") -> 3
// editDistance("intention", "execution") -> 5
public static int editDistance(String s1, String s2)
```
