// Run: node exemplar.js

/**
 * Returns the number of unique paths from top-left to bottom-right
 * in an m×n grid, moving only right or down.
 * dp[i][j] = dp[i-1][j] + dp[i][j-1]; first row/column = 1.
 * O(m·n) time and space.
 * @param {number} m - rows
 * @param {number} n - columns
 * @returns {number}
 */
function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }
  return dp[m - 1][n - 1];
}

/**
 * Returns the length of the longest common subsequence of s1 and s2.
 * (m+1) × (n+1) table; dp[i][j] refers to s1[i-1] and s2[j-1].
 * O(m·n) time and space.
 * @param {string} s1
 * @param {string} s2
 * @returns {number}
 */
function longestCommonSubsequence(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Returns the minimum edit distance (Levenshtein) from s1 to s2.
 * Operations: insert, delete, replace (each costs 1).
 * dp[i][0] = i (delete i chars); dp[0][j] = j (insert j chars).
 * O(m·n) time and space.
 * @param {string} s1
 * @param {string} s2
 * @returns {number}
 */
function editDistance(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

module.exports = { uniquePaths, longestCommonSubsequence, editDistance };

function main() {
  console.log(uniquePaths(3, 7));                               // 28
  console.log(uniquePaths(3, 2));                               // 3
  console.log(longestCommonSubsequence("abcde", "ace"));        // 3
  console.log(longestCommonSubsequence("abc", "def"));          // 0
  console.log(editDistance("horse", "ros"));                    // 3
  console.log(editDistance("intention", "execution"));          // 5
}

main();
