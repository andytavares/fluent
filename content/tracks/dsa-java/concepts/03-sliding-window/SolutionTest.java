public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // minSubArrayLen
        check("minSubArrayLen: classic example", Solution.minSubArrayLen(7, new int[]{2, 3, 1, 2, 4, 3}) == 2);
        check("minSubArrayLen: single element suffices", Solution.minSubArrayLen(4, new int[]{1, 4, 4}) == 1);
        check("minSubArrayLen: no subarray reaches target", Solution.minSubArrayLen(11, new int[]{1, 1, 1, 1, 1, 1, 1, 1}) == 0);
        check("minSubArrayLen: whole array sums exactly to target", Solution.minSubArrayLen(6, new int[]{1, 2, 3}) == 3);
        check("minSubArrayLen: single-element array meets target", Solution.minSubArrayLen(5, new int[]{5}) == 1);
        check("minSubArrayLen: single-element array misses target", Solution.minSubArrayLen(6, new int[]{5}) == 0);
        check("minSubArrayLen: empty array", Solution.minSubArrayLen(1, new int[]{}) == 0);
        check("minSubArrayLen: best window in the middle", Solution.minSubArrayLen(8, new int[]{1, 1, 7, 1, 1, 1}) == 2);
        check("minSubArrayLen: shrink past several small elements", Solution.minSubArrayLen(15, new int[]{1, 2, 3, 4, 5}) == 5);
        check("minSubArrayLen: large value late beats long early window", Solution.minSubArrayLen(10, new int[]{1, 1, 1, 1, 1, 1, 1, 1, 10}) == 1);

        // lengthOfLongestSubstring
        check("lengthOfLongestSubstring: classic example", Solution.lengthOfLongestSubstring("abcabcbb") == 3);
        check("lengthOfLongestSubstring: all identical", Solution.lengthOfLongestSubstring("bbbbb") == 1);
        check("lengthOfLongestSubstring: substring not subsequence", Solution.lengthOfLongestSubstring("pwwkew") == 3);
        check("lengthOfLongestSubstring: empty string", Solution.lengthOfLongestSubstring("") == 0);
        check("lengthOfLongestSubstring: single character", Solution.lengthOfLongestSubstring("z") == 1);
        check("lengthOfLongestSubstring: all distinct", Solution.lengthOfLongestSubstring("abcdef") == 6);
        check("lengthOfLongestSubstring: stale index must not move left backwards", Solution.lengthOfLongestSubstring("abba") == 2);
        check("lengthOfLongestSubstring: duplicate before current window", Solution.lengthOfLongestSubstring("tmmzuxt") == 5);
        check("lengthOfLongestSubstring: repeat forces partial jump", Solution.lengthOfLongestSubstring("dvdf") == 3);
        check("lengthOfLongestSubstring: spaces and symbols count as characters", Solution.lengthOfLongestSubstring("a b!a") == 4);

        // minWindow
        check("minWindow: classic example", Solution.minWindow("ADOBECODEBANC", "ABC").equals("BANC"));
        check("minWindow: single char match", Solution.minWindow("a", "a").equals("a"));
        check("minWindow: t longer than s", Solution.minWindow("a", "aa").equals(""));
        check("minWindow: duplicates in t both required", Solution.minWindow("aa", "aa").equals("aa"));
        check("minWindow: no valid window", Solution.minWindow("abc", "d").equals(""));
        check("minWindow: window at the very start", Solution.minWindow("abcde", "ab").equals("ab"));
        check("minWindow: window at the very end", Solution.minWindow("abcde", "de").equals("de"));
        check("minWindow: whole of s is the only valid window", Solution.minWindow("acb", "abc").equals("acb"));
        check("minWindow: must keep shrinking to the tightest window", Solution.minWindow("cabwefgewcwaefgcf", "cae").equals("cwae"));
        check("minWindow: duplicate requirement stops premature shrink", Solution.minWindow("abcdefa", "aa").equals("abcdefa"));
        check("minWindow: case sensitivity", Solution.minWindow("Aa", "A").equals("A"));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
