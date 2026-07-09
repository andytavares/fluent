import java.util.Arrays;

class Solution {

    public static int climbingStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }

    public static int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        int prev2 = nums[0], prev1 = Math.max(nums[0], nums[1]);
        for (int i = 2; i < nums.length; i++) {
            int curr = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }

    public static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1); // sentinel: value larger than any valid answer
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    public static void main(String[] args) {
        System.out.println(climbingStairs(5));                  // 8
        System.out.println(rob(new int[]{2,7,9,3,1}));          // 12
        System.out.println(coinChange(new int[]{1,5,10,25}, 36)); // 3
        System.out.println(coinChange(new int[]{2}, 3));          // -1
    }
}
