import java.util.HashSet;
import java.util.List;
import java.util.Set;

class Solution {

    /**
     * dp[i] = dp[i-1] + dp[i-2] (last move was 1 or 2 steps); only the last
     * two states are read, so two rolling variables replace the table.
     * O(n) time, O(1) space.
     */
    public static int climbStairs(int n) {
        int prev2 = 1; // dp[i-2], seeded with dp[0] = 1
        int prev1 = 1; // dp[i-1], seeded with dp[1] = 1
        for (int i = 2; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }

    /**
     * dp[i] = max(skip house i, rob it on top of dp[i-2]). Starting both
     * rolling variables at 0 encodes the empty base cases.
     * O(n) time, O(1) space.
     */
    public static int rob(int[] nums) {
        int prev2 = 0; // dp[i-2]
        int prev1 = 0; // dp[i-1]
        for (int num : nums) {
            int curr = Math.max(prev1, prev2 + num);
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }

    /**
     * dp[i] = the length-i prefix is segmentable; enumerate the last word
     * s.substring(j, i). The inner loop is capped by the longest word — no
     * word longer than that can end at i.
     * O(n * L^2) time, O(n) space.
     */
    public static boolean wordBreak(String s, List<String> wordDict) {
        Set<String> words = new HashSet<>(wordDict);
        int maxLen = 0;
        for (String w : wordDict) maxLen = Math.max(maxLen, w.length());

        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true; // empty prefix
        for (int i = 1; i <= s.length(); i++) {
            for (int j = i - 1; j >= 0 && i - j <= maxLen; j--) {
                if (dp[j] && words.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.length()];
    }

    /**
     * dp[a] = 1 + min(dp[a - c]) over coins; amount + 1 marks "unreachable"
     * and survives the +1 without ever looking like a valid answer.
     * O(amount * |coins|) time, O(amount) space.
     */
    public static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        java.util.Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int coin : coins) {
                if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    /**
     * Patience technique: tails[k] is the smallest possible tail of an
     * increasing subsequence of length k + 1. tails stays sorted, so each
     * number binary-searches the first tail >= it and overwrites (strictness),
     * or appends when it extends everything.
     * O(n log n) time, O(n) space.
     */
    public static int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length];
        int size = 0;
        for (int num : nums) {
            int lo = 0, hi = size;
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (tails[mid] < num) {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }
            tails[lo] = num; // overwrite the first tail >= num, or append
            if (lo == size) size++;
        }
        return size;
    }

    public static void main(String[] args) {
        System.out.println(climbStairs(5)); // 8
        System.out.println(rob(new int[]{2, 7, 9, 3, 1})); // 12
        System.out.println(wordBreak("leetcode", List.of("leet", "code"))); // true
        System.out.println(coinChange(new int[]{1, 2, 5}, 11)); // 3
        System.out.println(lengthOfLIS(new int[]{10, 9, 2, 5, 3, 7, 101, 18})); // 4
    }
}
