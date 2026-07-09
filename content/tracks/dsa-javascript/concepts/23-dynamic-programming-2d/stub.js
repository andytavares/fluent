// Run: node stub.js

/**
 * Returns the minimum path sum from top-left to bottom-right,
 * moving only right or down.
 * @param {number[][]} grid
 * @returns {number}
 */
function minPathSum(grid) {
  // TODO: dp[j] = grid[i][j] + min(up, left) with one rolling row;
  // seed the first row with prefix sums
  return 0;
}

/**
 * Returns the number of right/down paths avoiding all obstacle (1) cells.
 * @param {number[][]} obstacleGrid
 * @returns {number}
 */
function uniquePathsWithObstacles(obstacleGrid) {
  // TODO: rolling row; obstacle → dp[j] = 0, else dp[j] += dp[j-1];
  // seed dp[0] = 1 only if the start cell is open
  return 0;
}

/**
 * Returns the longest palindromic substring of s (any one if ties).
 * @param {string} s
 * @returns {string}
 */
function longestPalindrome(s) {
  // TODO: expand around each of the 2n-1 centers (char and gap),
  // or fill isPal[i][j] by increasing substring length — track best start/len
  return "";
}

/**
 * Returns the Levenshtein distance between word1 and word2.
 * @param {string} word1
 * @param {string} word2
 * @returns {number}
 */
function minDistance(word1, word2) {
  // TODO: (m+1)x(n+1) prefix table; dp[i][0] = i, dp[0][j] = j;
  // match → diagonal, else 1 + min(delete, insert, replace)
  return 0;
}

/**
 * Returns the area of the largest all-"1" square in a "0"/"1" string matrix.
 * @param {string[][]} matrix
 * @returns {number}
 */
function maximalSquare(matrix) {
  // TODO: side[i][j] = "1" ? 1 + min(up, left, up-left) : 0; keep two rows
  // (the diagonal!); track the best side and return side * side
  return 0;
}

module.exports = {
  minPathSum,
  uniquePathsWithObstacles,
  longestPalindrome,
  minDistance,
  maximalSquare,
};

function main() {
  console.log(minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])); // 7
  console.log(uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]])); // 2
  console.log(longestPalindrome("babad")); // "bab" or "aba"
  console.log(minDistance("horse", "ros")); // 3
  console.log(maximalSquare([["1", "1"], ["1", "1"]])); // 4
}

main();
