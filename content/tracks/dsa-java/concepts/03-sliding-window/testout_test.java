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

        int[] hundredK = new int[100000];
        java.util.Arrays.fill(hundredK, 1);
        check("minSubArrayLen: 100k ones - must be linear", Solution.minSubArrayLen(100, hundredK) == 100);

        int[] spikeAtEnd = new int[100000];
        java.util.Arrays.fill(spikeAtEnd, 1);
        spikeAtEnd[99999] = 1000;
        check("minSubArrayLen: 100k elements, spike at the end", Solution.minSubArrayLen(1000, spikeAtEnd) == 1);

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

        StringBuilder repeatSb = new StringBuilder();
        for (int i = 0; i < 10000; i++) repeatSb.append("abcdefghij");
        check("lengthOfLongestSubstring: 100k repeating pattern - must be linear", Solution.lengthOfLongestSubstring(repeatSb.toString()) == 10);

        StringBuilder longPrefixSb = new StringBuilder();
        for (int i = 0; i < 50000; i++) longPrefixSb.append("ab");
        longPrefixSb.append("cdefghij");
        check("lengthOfLongestSubstring: long prefix, distinct run at the end", Solution.lengthOfLongestSubstring(longPrefixSb.toString()) == 10);

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

        StringBuilder junkPrefixSb = new StringBuilder();
        for (int i = 0; i < 100000; i++) junkPrefixSb.append('x');
        junkPrefixSb.append("abc");
        check("minWindow: 100k junk prefix - must be linear", Solution.minWindow(junkPrefixSb.toString(), "abc").equals("abc"));

        StringBuilder sHeavy = new StringBuilder();
        for (int i = 0; i < 100000; i++) sHeavy.append('a');
        StringBuilder tHeavy = new StringBuilder();
        for (int i = 0; i < 50000; i++) tHeavy.append('a');
        check("minWindow: heavy duplicates at scale", Solution.minWindow(sHeavy.toString(), tHeavy.toString()).equals(tHeavy.toString()));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
