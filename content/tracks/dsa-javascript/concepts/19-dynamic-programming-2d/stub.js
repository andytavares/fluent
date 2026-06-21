// Run: node stub.js

/**
 * Returns the number of unique paths from top-left to bottom-right
 * in an m×n grid, moving only right or down.
 * @param {number} m - rows
 * @param {number} n - columns
 * @returns {number}
 */
function uniquePaths(m, n) {
  // TODO: dp[i][j] = dp[i-1][j] + dp[i][j-1]
  // Base case: first row and first column are all 1
  return 0;
}

/**
 * Returns the length of the longest common subsequence of s1 and s2.
 * @param {string} s1
 * @param {string} s2
 * @returns {number}
 */
function longestCommonSubsequence(s1, s2) {
  // TODO: (m+1) x (n+1) table
  // if s1[i-1] === s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
  // else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  return 0;
}

/**
 * Returns the minimum edit distance (Levenshtein) between s1 and s2.
 * @param {string} s1
 * @param {string} s2
 * @returns {number}
 */
function editDistance(s1, s2) {
  // TODO: (m+1) x (n+1) table
  // Base: dp[i][0] = i, dp[0][j] = j
  // if equal: dp[i][j] = dp[i-1][j-1]
  // else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return 0;
}

module.exports = { uniquePaths, longestCommonSubsequence, editDistance };

function main() {
  console.log(uniquePaths(3, 7));                              // 28
  console.log(longestCommonSubsequence("abcde", "ace"));       // 3
  console.log(editDistance("horse", "ros"));                   // 3
}

main();
