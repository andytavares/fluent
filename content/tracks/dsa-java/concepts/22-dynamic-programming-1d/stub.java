import java.util.List;

class Solution {

    /**
     * Returns the number of distinct ways to climb n stairs (1 or 2 at a time).
     */
    public static int climbStairs(int n) {
        // TODO: dp[i] = dp[i-1] + dp[i-2], seeded dp[0] = dp[1] = 1;
        // keep only the last two values (two rolling variables)
        return 0;
    }

    /**
     * Returns the max loot from a row of houses with no two adjacent robbed.
     */
    public static int rob(int[] nums) {
        // TODO: dp[i] = max(dp[i-1], dp[i-2] + nums[i]); two rolling
        // variables starting at 0 handle the empty-array base case for free
        return 0;
    }

    /**
     * Returns true if s can be split entirely into dictionary words.
     */
    public static boolean wordBreak(String s, List<String> wordDict) {
        // TODO: dp[i] = the length-i prefix is segmentable; dp[0] = true;
        // dp[i] is true if some j < i has dp[j] true and s.substring(j, i)
        // in a HashSet built from wordDict
        return false;
    }

    /**
     * Returns the fewest coins summing exactly to amount, or -1 if impossible.
     */
    public static int coinChange(int[] coins, int amount) {
        // TODO: dp[a] = 1 + min(dp[a - c]) over coins c <= a; sentinel
        // amount + 1 for "unreachable"; dp[0] = 0
        return 0;
    }

    /**
     * Returns the length of the longest strictly increasing subsequence.
     */
    public static int lengthOfLIS(int[] nums) {
        // TODO: O(n^2) table (dp[i] = 1 + max(dp[j]) for j < i, nums[j] <
        // nums[i]) or the O(n log n) tails technique — binary search the
        // first tail >= num and overwrite it, or append
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(climbStairs(5)); // 8
        System.out.println(rob(new int[]{2, 7, 9, 3, 1})); // 12
        System.out.println(wordBreak("leetcode", List.of("leet", "code"))); // true
        System.out.println(coinChange(new int[]{1, 2, 5}, 11)); // 3
        System.out.println(lengthOfLIS(new int[]{10, 9, 2, 5, 3, 7, 101, 18})); // 4
    }
}
