public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // uniquePaths
        check("up: 3x7 -> 28",   Solution.uniquePaths(3, 7) == 28);
        check("up: 3x2 -> 3",    Solution.uniquePaths(3, 2) == 3);
        check("up: 1x1 -> 1",    Solution.uniquePaths(1, 1) == 1);
        check("up: 1x5 -> 1",    Solution.uniquePaths(1, 5) == 1);
        check("up: 5x1 -> 1",    Solution.uniquePaths(5, 1) == 1);
        check("up: 2x2 -> 2",    Solution.uniquePaths(2, 2) == 2);
        check("up: 7x3 -> 28",   Solution.uniquePaths(7, 3) == 28);

        // longestCommonSubsequence
        check("lcs: abcde / ace -> 3",
              Solution.longestCommonSubsequence("abcde", "ace") == 3);
        check("lcs: abc / abc -> 3",
              Solution.longestCommonSubsequence("abc", "abc") == 3);
        check("lcs: abc / def -> 0",
              Solution.longestCommonSubsequence("abc", "def") == 0);
        check("lcs: empty / abc -> 0",
              Solution.longestCommonSubsequence("", "abc") == 0);
        check("lcs: a / a -> 1",
              Solution.longestCommonSubsequence("a", "a") == 1);
        check("lcs: bsbinc / jmjkds -> 1",
              Solution.longestCommonSubsequence("bsbinc", "jmjkds") == 1);

        // editDistance
        check("ed: horse -> ros -> 3",
              Solution.editDistance("horse", "ros") == 3);
        check("ed: intention -> execution -> 5",
              Solution.editDistance("intention", "execution") == 5);
        check("ed: empty -> abc -> 3",
              Solution.editDistance("", "abc") == 3);
        check("ed: abc -> empty -> 3",
              Solution.editDistance("abc", "") == 3);
        check("ed: abc -> abc -> 0",
              Solution.editDistance("abc", "abc") == 0);
        check("ed: a -> b -> 1",
              Solution.editDistance("a", "b") == 1);
        check("ed: kitten -> sitting -> 3",
              Solution.editDistance("kitten", "sitting") == 3);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
