public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    // Ties are allowed in longestPalindrome — validate by property.
    static boolean checkLongestPalindrome(String s, int expectedLen) {
        String result = Solution.longestPalindrome(s);
        if (result.length() != expectedLen) return false;
        if (!s.contains(result)) return false;
        return result.equals(new StringBuilder(result).reverse().toString());
    }

    public static void main(String[] args) {
        // minPathSum
        check("minPathSum: classic 3x3",
              Solution.minPathSum(new int[][]{{1, 3, 1}, {1, 5, 1}, {4, 2, 1}}) == 7);
        check("minPathSum: 2x3 grid",
              Solution.minPathSum(new int[][]{{1, 2, 3}, {4, 5, 6}}) == 12);
        check("minPathSum: single cell",
              Solution.minPathSum(new int[][]{{3}}) == 3);
        check("minPathSum: single row is a forced path",
              Solution.minPathSum(new int[][]{{1, 2, 3, 4}}) == 10);
        check("minPathSum: single column is a forced path",
              Solution.minPathSum(new int[][]{{1}, {2}, {3}}) == 6);
        check("minPathSum: zeros in the grid",
              Solution.minPathSum(new int[][]{{0, 0, 9}, {9, 0, 0}}) == 0);
        check("minPathSum: cheap detour beats direct diagonal-ish route",
              Solution.minPathSum(new int[][]{{1, 9, 9}, {1, 9, 9}, {1, 1, 1}}) == 5);

        // uniquePathsWithObstacles
        check("uniquePathsWithObstacles: obstacle in the middle",
              Solution.uniquePathsWithObstacles(new int[][]{{0, 0, 0}, {0, 1, 0}, {0, 0, 0}}) == 2);
        check("uniquePathsWithObstacles: 2x2 with one obstacle",
              Solution.uniquePathsWithObstacles(new int[][]{{0, 1}, {0, 0}}) == 1);
        check("uniquePathsWithObstacles: blocked start",
              Solution.uniquePathsWithObstacles(new int[][]{{1}}) == 0);
        check("uniquePathsWithObstacles: open single cell",
              Solution.uniquePathsWithObstacles(new int[][]{{0}}) == 1);
        check("uniquePathsWithObstacles: blocked goal",
              Solution.uniquePathsWithObstacles(new int[][]{{0, 0}, {0, 1}}) == 0);
        check("uniquePathsWithObstacles: obstacle wall cuts the grid",
              Solution.uniquePathsWithObstacles(new int[][]{{0, 1, 0}, {0, 1, 0}, {0, 1, 0}}) == 0);
        check("uniquePathsWithObstacles: no obstacles — pure counting",
              Solution.uniquePathsWithObstacles(new int[3][7]) == 28);
        check("uniquePathsWithObstacles: obstacle in a single row",
              Solution.uniquePathsWithObstacles(new int[][]{{0, 1, 0}}) == 0);

        // longestPalindrome
        check("longestPalindrome: babad — two valid answers",
              checkLongestPalindrome("babad", 3));
        check("longestPalindrome: even-length palindrome",
              Solution.longestPalindrome("cbbd").equals("bb"));
        check("longestPalindrome: single character",
              Solution.longestPalindrome("a").equals("a"));
        check("longestPalindrome: no palindrome longer than 1",
              checkLongestPalindrome("ac", 1));
        check("longestPalindrome: whole string",
              Solution.longestPalindrome("racecar").equals("racecar"));
        check("longestPalindrome: even palindrome mid-string",
              Solution.longestPalindrome("forgeeksskeegfor").equals("geeksskeeg"));
        check("longestPalindrome: repeated character block",
              Solution.longestPalindrome("aaaa").equals("aaaa"));
        check("longestPalindrome: near-palindromic ends trap",
              checkLongestPalindrome("aacabdkacaa", 3));

        // minDistance
        check("minDistance: classic horse/ros", Solution.minDistance("horse", "ros") == 3);
        check("minDistance: intention/execution",
              Solution.minDistance("intention", "execution") == 5);
        check("minDistance: empty source", Solution.minDistance("", "abc") == 3);
        check("minDistance: empty target", Solution.minDistance("abc", "") == 3);
        check("minDistance: both empty", Solution.minDistance("", "") == 0);
        check("minDistance: equal strings", Solution.minDistance("abc", "abc") == 0);
        check("minDistance: transposition costs 2 — no swap op",
              Solution.minDistance("ab", "ba") == 2);
        check("minDistance: disjoint alphabets", Solution.minDistance("aaa", "bbbbb") == 5);

        // maximalSquare
        check("maximalSquare: classic 4x5", Solution.maximalSquare(new char[][]{
            {'1', '0', '1', '0', '0'},
            {'1', '0', '1', '1', '1'},
            {'1', '1', '1', '1', '1'},
            {'1', '0', '0', '1', '0'},
        }) == 4);
        check("maximalSquare: only single ones",
              Solution.maximalSquare(new char[][]{{'0', '1'}, {'1', '0'}}) == 1);
        check("maximalSquare: all zeros", Solution.maximalSquare(new char[][]{{'0'}}) == 0);
        check("maximalSquare: single one", Solution.maximalSquare(new char[][]{{'1'}}) == 1);
        check("maximalSquare: rectangle of ones capped by shorter side",
              Solution.maximalSquare(new char[][]{
                  {'1', '1', '1', '1'},
                  {'1', '1', '1', '1'},
                  {'1', '1', '1', '1'},
              }) == 9);
        check("maximalSquare: full ones matrix",
              Solution.maximalSquare(new char[][]{
                  {'1', '1', '1'},
                  {'1', '1', '1'},
                  {'1', '1', '1'},
              }) == 9);
        check("maximalSquare: string cells — '1' the character, not the number",
              Solution.maximalSquare(new char[][]{{'1', '1'}, {'1', '1'}}) == 4);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
