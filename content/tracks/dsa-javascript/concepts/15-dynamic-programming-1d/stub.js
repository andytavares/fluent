// Run: node stub.js

/**
 * Returns the number of distinct ways to climb n stairs (1 or 2 steps at a time).
 * @param {number} n
 * @returns {number}
 */
function climbingStairs(n) {
  // TODO: dp[i] = dp[i-1] + dp[i-2]; space-optimize to two variables
  return 0;
}

/**
 * Returns the maximum amount that can be robbed without robbing adjacent houses.
 * @param {number[]} nums
 * @returns {number}
 */
function rob(nums) {
  // TODO: dp[i] = max(dp[i-1], dp[i-2] + nums[i]); track prev2, prev1
  return 0;
}

/**
 * Returns the minimum number of coins to make amount, or -1 if impossible.
 * @param {number[]} coins
 * @param {number} amount
 * @returns {number}
 */
function coinChange(coins, amount) {
  // TODO: dp[0]=0, dp[i]=min over coins of dp[i-coin]+1 if coin<=i
  // return dp[amount] === Infinity ? -1 : dp[amount]
  return 0;
}

module.exports = { climbingStairs, rob, coinChange };

function main() {
  console.log(climbingStairs(5));          // 8
  console.log(rob([2, 7, 9, 3, 1]));      // 12
  console.log(coinChange([1, 5, 11], 15)); // 3
}

main();
