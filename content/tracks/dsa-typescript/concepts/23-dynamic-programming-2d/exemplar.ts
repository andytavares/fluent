// Run: npx tsx exemplar.ts

/**
 * Returns the minimum path sum from top-left to bottom-right,
 * moving only right or down.
 * Rolling row: before the write, dp[j] holds "up"; dp[j-1] is "left".
 * O(m*n) time, O(n) space.
 */
function minPathSum(grid: number[][]): number {
  const cols = grid[0].length;
  const dp = grid[0].slice(); // first row: prefix sums
  for (let j = 1; j < cols; j++) dp[j] += dp[j - 1];
  for (let i = 1; i < grid.length; i++) {
    dp[0] += grid[i][0]; // first column: only "up"
    for (let j = 1; j < cols; j++) {
      dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j];
    }
  }
  return dp[cols - 1];
}

/**
 * Returns the number of right/down paths avoiding all obstacle (1) cells.
 * Rolling row; applying the obstacle rule before the addition makes the
 * first row, first column, and blocked start all fall out uniformly.
 * O(m*n) time, O(n) space.
 */
function uniquePathsWithObstacles(obstacleGrid: number[][]): number {
  const cols = obstacleGrid[0].length;
  const dp: number[] = new Array(cols).fill(0);
  dp[0] = obstacleGrid[0][0] === 1 ? 0 : 1;
  for (let i = 0; i < obstacleGrid.length; i++) {
    for (let j = 0; j < cols; j++) {
      if (obstacleGrid[i][j] === 1) {
        dp[j] = 0; // nothing routes through an obstacle
      } else if (j > 0) {
        dp[j] += dp[j - 1]; // up (old dp[j]) + left (new dp[j-1])
      }
    }
  }
  return dp[cols - 1];
}

/**
 * Returns the longest palindromic substring of s (any one if ties).
 * Expand around center — the O(1)-space form of the isPal[i][j] table:
 * every palindrome has one of 2n-1 centers (a character or a gap).
 * O(n^2) time worst case, O(1) space.
 */
function longestPalindrome(s: string): string {
  let start = 0, maxLen = 1;
  const expand = (left: number, right: number): void => {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    // the palindrome is s[left+1 .. right-1]
    const len = right - left - 1;
    if (len > maxLen) {
      maxLen = len;
      start = left + 1;
    }
  };
  for (let i = 0; i < s.length; i++) {
    expand(i, i); // odd length, centered on a character
    expand(i, i + 1); // even length, centered on a gap
  }
  return s.slice(start, start + maxLen);
}

/**
 * Returns the Levenshtein distance between word1 and word2.
 * Prefix-pair table kept as two rows; row/column 0 encode empty prefixes,
 * so empty inputs need no special case.
 * O(m*n) time, O(n) space.
 */
function minDistance(word1: string, word2: string): number {
  const m = word1.length, n = word2.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j); // dp[0][j] = j inserts
  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1);
    curr[0] = i; // dp[i][0] = i deletes
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
      }
    }
    prev = curr;
  }
  return prev[n];
}

/**
 * Returns the area of the largest all-"1" square in a "0"/"1" string matrix.
 * side[i][j] = largest square ending at (i,j) = 1 + min(up, left, up-left).
 * Two rows (not one) because the recurrence needs the diagonal; the extra
 * leading zero column makes the edges uniform.
 * O(m*n) time, O(n) space.
 */
function maximalSquare(matrix: string[][]): number {
  const cols = matrix[0].length;
  let prev: number[] = new Array(cols + 1).fill(0);
  let best = 0;
  for (let i = 0; i < matrix.length; i++) {
    const curr: number[] = new Array(cols + 1).fill(0);
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j] === "1") {
        curr[j + 1] = 1 + Math.min(prev[j], prev[j + 1], curr[j]);
        if (curr[j + 1] > best) best = curr[j + 1];
      }
    }
    prev = curr;
  }
  return best * best;
}

export {
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
