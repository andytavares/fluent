class Solution {

    /**
     * Returns the minimum path sum from top-left to bottom-right,
     * moving only right or down.
     * Rolling row: before the write, dp[j] holds "up"; dp[j-1] is "left".
     * O(m*n) time, O(n) space.
     */
    public static int minPathSum(int[][] grid) {
        int cols = grid[0].length;
        int[] dp = grid[0].clone(); // first row: prefix sums
        for (int j = 1; j < cols; j++) dp[j] += dp[j - 1];
        for (int i = 1; i < grid.length; i++) {
            dp[0] += grid[i][0]; // first column: only "up"
            for (int j = 1; j < cols; j++) {
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
    public static int uniquePathsWithObstacles(int[][] obstacleGrid) {
        int cols = obstacleGrid[0].length;
        int[] dp = new int[cols];
        dp[0] = obstacleGrid[0][0] == 1 ? 0 : 1;
        for (int i = 0; i < obstacleGrid.length; i++) {
            for (int j = 0; j < cols; j++) {
                if (obstacleGrid[i][j] == 1) {
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
    public static String longestPalindrome(String s) {
        int[] best = {0, 1}; // start, maxLen
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i, best);     // odd length, centered on a character
            expand(s, i, i + 1, best); // even length, centered on a gap
        }
        return s.substring(best[0], best[0] + best[1]);
    }

    private static void expand(String s, int left, int right, int[] best) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        // the palindrome is s[left+1 .. right-1]
        int len = right - left - 1;
        if (len > best[1]) {
            best[1] = len;
            best[0] = left + 1;
        }
    }

    /**
     * Returns the Levenshtein distance between word1 and word2.
     * Prefix-pair table kept as two rows; row/column 0 encode empty prefixes,
     * so empty inputs need no special case.
     * O(m*n) time, O(n) space.
     */
    public static int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[] prev = new int[n + 1];
        for (int j = 0; j <= n; j++) prev[j] = j; // dp[0][j] = j inserts
        for (int i = 1; i <= m; i++) {
            int[] curr = new int[n + 1];
            curr[0] = i; // dp[i][0] = i deletes
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    curr[j] = prev[j - 1];
                } else {
                    curr[j] = 1 + Math.min(prev[j], Math.min(curr[j - 1], prev[j - 1]));
                }
            }
            prev = curr;
        }
        return prev[n];
    }

    /**
     * Returns the area of the largest all-'1' square in a '0'/'1' char matrix.
     * side[i][j] = largest square ending at (i,j) = 1 + min(up, left, up-left).
     * Two rows (not one) because the recurrence needs the diagonal; the extra
     * leading zero column makes the edges uniform.
     * O(m*n) time, O(n) space.
     */
    public static int maximalSquare(char[][] matrix) {
        int cols = matrix[0].length;
        int[] prev = new int[cols + 1];
        int best = 0;
        for (int i = 0; i < matrix.length; i++) {
            int[] curr = new int[cols + 1];
            for (int j = 0; j < cols; j++) {
                if (matrix[i][j] == '1') {
                    curr[j + 1] = 1 + Math.min(prev[j], Math.min(prev[j + 1], curr[j]));
                    if (curr[j + 1] > best) best = curr[j + 1];
                }
            }
            prev = curr;
        }
        return best * best;
    }

    public static void main(String[] args) {
        System.out.println(minPathSum(new int[][]{{1, 3, 1}, {1, 5, 1}, {4, 2, 1}})); // 7
        System.out.println(uniquePathsWithObstacles(new int[][]{{0, 0, 0}, {0, 1, 0}, {0, 0, 0}})); // 2
        System.out.println(longestPalindrome("babad")); // "bab" or "aba"
        System.out.println(minDistance("horse", "ros")); // 3
        System.out.println(maximalSquare(new char[][]{{'1', '1'}, {'1', '1'}})); // 4
    }
}
