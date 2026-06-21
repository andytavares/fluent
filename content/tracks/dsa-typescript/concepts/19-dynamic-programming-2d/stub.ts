// Run: tsx stub.ts

// Count the number of unique paths from top-left to bottom-right
// in an m×n grid, moving only right or down.
export function uniquePaths(m: number, n: number): number {
  // TODO: dp[i][j] = dp[i-1][j] + dp[i][j-1]; base: all 1s on first row/col
  return 0;
}

// Return the length of the longest common subsequence of s1 and s2.
export function longestCommonSubsequence(s1: string, s2: string): number {
  // TODO: dp[i][j] = LCS of s1[0..i-1] and s2[0..j-1]
  return 0;
}

// Return the minimum edit distance (insert, delete, replace) from s1 to s2.
export function editDistance(s1: string, s2: string): number {
  // TODO: dp[i][j] = min edits to convert s1[0..i-1] to s2[0..j-1]
  return 0;
}

// Usage example:
// uniquePaths(3, 7)                          // 28
// longestCommonSubsequence("abcde", "ace")   // 3
// editDistance("horse", "ros")               // 3
