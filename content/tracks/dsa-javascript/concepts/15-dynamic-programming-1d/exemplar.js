// Run: node exemplar.js

/**
 * Returns the number of distinct ways to climb n stairs (1 or 2 steps).
 * dp[i] = dp[i-1] + dp[i-2]; space-optimized to two variables.
 * @param {number} n
 * @returns {number}
 */
function climbingStairs(n) {
  if (n <= 1) return 1;
  let prev2 = 1, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

/**
 * Returns the maximum amount robbed without robbing adjacent houses.
 * dp[i] = max(dp[i-1], dp[i-2] + nums[i]); space-optimized.
 * @param {number[]} nums
 * @returns {number}
 */
function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    const curr = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

/**
 * Returns the minimum number of coins to make amount, or -1 if impossible.
 * dp[i] = min over coins of (dp[i - coin] + 1).
 * @param {number[]} coins
 * @param {number} amount
 * @returns {number}
 */
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

module.exports = { climbingStairs, rob, coinChange };

function main() {
  console.log(climbingStairs(5));          // 8
  console.log(rob([2, 7, 9, 3, 1]));      // 12
  console.log(coinChange([1, 5, 11], 15)); // 3
  console.log(coinChange([2], 3));         // -1
}

main();
