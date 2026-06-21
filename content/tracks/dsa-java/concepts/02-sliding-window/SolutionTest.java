public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // longestUniqueSubstring
        check("lus: abcabcbb -> 3",   Solution.longestUniqueSubstring("abcabcbb") == 3);
        check("lus: bbbbb -> 1",      Solution.longestUniqueSubstring("bbbbb") == 1);
        check("lus: pwwkew -> 3",     Solution.longestUniqueSubstring("pwwkew") == 3);
        check("lus: empty -> 0",      Solution.longestUniqueSubstring("") == 0);
        check("lus: single char -> 1",Solution.longestUniqueSubstring("z") == 1);
        check("lus: all unique",      Solution.longestUniqueSubstring("abcde") == 5);
        check("lus: abba -> 2",       Solution.longestUniqueSubstring("abba") == 2);

        // maxSumSubarray
        check("mss: [2,1,5,1,3,2] k=3 -> 9",
              Solution.maxSumSubarray(new int[]{2,1,5,1,3,2}, 3) == 9);
        check("mss: [2,3,4,1,5] k=2 -> 7",
              Solution.maxSumSubarray(new int[]{2,3,4,1,5}, 2) == 7);
        check("mss: k=len returns total",
              Solution.maxSumSubarray(new int[]{1,2,3}, 3) == 6);
        check("mss: k=1 returns max element",
              Solution.maxSumSubarray(new int[]{3,1,4,1,5}, 1) == 5);
        check("mss: all negatives",
              Solution.maxSumSubarray(new int[]{-1,-2,-3,-4}, 2) == -3);

        // minWindowSubstring
        check("mws: ADOBECODEBANC / ABC -> BANC",
              Solution.minWindowSubstring("ADOBECODEBANC", "ABC").equals("BANC"));
        check("mws: a / a -> a",
              Solution.minWindowSubstring("a", "a").equals("a"));
        check("mws: a / b -> empty",
              Solution.minWindowSubstring("a", "b").equals(""));
        check("mws: aa / aa -> aa",
              Solution.minWindowSubstring("aa", "aa").equals("aa"));
        check("mws: empty s -> empty",
              Solution.minWindowSubstring("", "a").equals(""));
        check("mws: t longer than s -> empty",
              Solution.minWindowSubstring("ab", "abc").equals(""));
        check("mws: exact match",
              Solution.minWindowSubstring("ABC", "ABC").equals("ABC"));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
