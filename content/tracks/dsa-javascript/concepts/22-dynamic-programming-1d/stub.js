// Run: node stub.js

/**
 * Returns the number of distinct ways to climb n stairs with 1- or 2-steps.
 * @param {number} n
 * @returns {number}
 */
function climbStairs(n) {
  // TODO: dp[i] = dp[i-1] + dp[i-2], dp[0] = dp[1] = 1
  // roll two variables — O(1) space
  return 0;
}

/**
 * Returns the max loot from a row of houses with no two adjacent robbed.
 * @param {number[]} nums
 * @returns {number}
 */
function rob(nums) {
  // TODO: dp[i] = max(dp[i-1], dp[i-2] + nums[i]); start both rolling
  // variables at 0 (handles the empty array too)
  return 0;
}

/**
 * Returns true if s can be split entirely into dictionary words.
 * @param {string} s
 * @param {string[]} wordDict
 * @returns {boolean}
 */
function wordBreak(s, wordDict) {
  // TODO: dp[i] = some j < i with dp[j] && dict.has(s.slice(j, i));
  // dp[0] = true; use a Set; dp has s.length + 1 entries
  return false;
}

/**
 * Returns the fewest coins summing exactly to amount, or -1 if impossible.
 * @param {number[]} coins
 * @param {number} amount
 * @returns {number}
 */
function coinChange(coins, amount) {
  // TODO: dp[a] = 1 + min(dp[a - c]) over coins c <= a; dp[0] = 0,
  // everything else Infinity; return -1 when dp[amount] stays Infinity
  return -1;
}

/**
 * Returns the length of the longest strictly increasing subsequence.
 * @param {number[]} nums
 * @returns {number}
 */
function lengthOfLIS(nums) {
  // TODO: dp[i] = 1 + max(dp[j]) over j < i with nums[j] < nums[i],
  // answer = max(dp) — or the O(n log n) tails + binary search version
  return 0;
}

module.exports = { climbStairs, rob, wordBreak, coinChange, lengthOfLIS };

function main() {
  console.log(climbStairs(5)); // 8
  console.log(rob([2, 7, 9, 3, 1])); // 12
  console.log(wordBreak("leetcode", ["leet", "code"])); // true
  console.log(coinChange([1, 2, 5], 11)); // 3
  console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
}

main();
