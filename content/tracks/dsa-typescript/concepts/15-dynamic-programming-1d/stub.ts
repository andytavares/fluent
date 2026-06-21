// Run: tsx stub.ts

// Return the number of distinct ways to climb n stairs (1 or 2 steps at a time).
export function climbingStairs(n: number): number {
  // TODO: dp[i] = dp[i-1] + dp[i-2]; space-optimize to O(1) with two variables
  return 0;
}

// Return the maximum amount you can rob without robbing adjacent houses.
export function rob(nums: number[]): number {
  // TODO: dp[i] = max(dp[i-1], dp[i-2] + nums[i]); track prev2 and prev1
  return 0;
}

// Return fewest coins to make amount, or -1 if impossible.
export function coinChange(coins: number[], amount: number): number {
  // TODO: dp[0]=0, dp[i]=1+min(dp[i-coin]) for each coin<=i; fill with Infinity
  return 0;
}

// Usage example:
// climbingStairs(5)              // 8
// rob([2,7,9,3,1])              // 12
// coinChange([1,5,11], 15)      // 3
