class Solution {

    /**
     * Returns the minimum path sum from top-left to bottom-right,
     * moving only right or down.
     */
    public static int minPathSum(int[][] grid) {
        // TODO: rolling row — dp = first row (prefix sums); for each later
        // row, dp[0] += grid[i][0], then dp[j] = min(dp[j], dp[j-1]) + grid[i][j]
        return 0;
    }

    /**
     * Returns the number of right/down paths avoiding all obstacle (1) cells.
     */
    public static int uniquePathsWithObstacles(int[][] obstacleGrid) {
        // TODO: rolling row; on an obstacle set dp[j] = 0 BEFORE any addition,
        // else dp[j] += dp[j-1] for j > 0; seed dp[0] from the start cell
        return 0;
    }

    /**
     * Returns the longest palindromic substring of s (any one if ties).
     */
    public static String longestPalindrome(String s) {
        // TODO: expand around each of the 2n-1 centers (n characters, n-1
        // gaps); track the longest match found
        return "";
    }

    /**
     * Returns the Levenshtein distance between word1 and word2.
     */
    public static int minDistance(String word1, String word2) {
        // TODO: prefix-pair table, two rows; dp[0][j] = j, dp[i][0] = i;
        // match -> diagonal; mismatch -> 1 + min(up, left, diagonal)
        return 0;
    }

    /**
     * Returns the area of the largest all-'1' square in a '0'/'1' char matrix.
     */
    public static int maximalSquare(char[][] matrix) {
        // TODO: side[i][j] = 1 + min(up, left, up-left) when the cell is '1',
        // else 0; keep two rows for the diagonal; return best side squared
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minPathSum(new int[][]{{1, 3, 1}, {1, 5, 1}, {4, 2, 1}})); // 7
        System.out.println(uniquePathsWithObstacles(new int[][]{{0, 0, 0}, {0, 1, 0}, {0, 0, 0}})); // 2
        System.out.println(longestPalindrome("babad")); // "bab" or "aba"
        System.out.println(minDistance("horse", "ros")); // 3
        System.out.println(maximalSquare(new char[][]{{'1', '1'}, {'1', '1'}})); // 4
    }
}
