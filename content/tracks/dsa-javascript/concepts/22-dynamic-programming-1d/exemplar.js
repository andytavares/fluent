// Run: node exemplar.js

/**
 * Returns the number of distinct ways to climb n stairs with 1- or 2-steps.
 * dp[i] = dp[i-1] + dp[i-2] (last move was 1 or 2 steps); only the last
 * two states are read, so two rolling variables replace the table.
 * O(n) time, O(1) space.
 * @param {number} n
 * @returns {number}
 */
function climbStairs(n) {
  let prev2 = 1; // dp[i-2], seeded with dp[0] = 1
  let prev1 = 1; // dp[i-1], seeded with dp[1] = 1
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

/**
 * Returns the max loot from a row of houses with no two adjacent robbed.
 * dp[i] = max(skip house i, rob it on top of dp[i-2]). Starting both
 * rolling variables at 0 encodes the empty base cases.
 * O(n) time, O(1) space.
 * @param {number[]} nums
 * @returns {number}
 */
function rob(nums) {
  let prev2 = 0; // dp[i-2]
  let prev1 = 0; // dp[i-1]
  for (const num of nums) {
    const curr = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

/**
 * Returns true if s can be split entirely into dictionary words.
 * dp[i] = the length-i prefix is segmentable; enumerate the last word
 * s.slice(j, i). The inner loop is capped by the longest word — no word
 * longer than that can end at i.
 * O(n * L^2) time, O(n) space.
 * @param {string} s
 * @param {string[]} wordDict
 * @returns {boolean}
 */
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const maxLen = wordDict.reduce((m, w) => Math.max(m, w.length), 0);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true; // empty prefix
  for (let i = 1; i <= s.length; i++) {
    for (let j = i - 1; j >= 0 && i - j <= maxLen; j--) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}

/**
 * Returns the fewest coins summing exactly to amount, or -1 if impossible.
 * dp[a] = 1 + min(dp[a - c]) over coins; Infinity marks "unreachable" and
 * survives the +1 without corrupting comparisons.
 * O(amount * |coins|) time, O(amount) space.
 * @param {number[]} coins
 * @param {number} amount
 * @returns {number}
 */
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) {
        dp[a] = dp[a - coin] + 1;
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

/**
 * Returns the length of the longest strictly increasing subsequence.
 * Patience technique: tails[k] is the smallest possible tail of an
 * increasing subsequence of length k + 1. tails stays sorted, so each
 * number binary-searches the first tail >= it and overwrites (strictness),
 * or appends when it extends everything.
 * O(n log n) time, O(n) space.
 * @param {number[]} nums
 * @returns {number}
 */
function lengthOfLIS(nums) {
  const tails = [];
  for (const num of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < num) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    tails[lo] = num; // overwrite the first tail >= num, or append
  }
  return tails.length;
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
