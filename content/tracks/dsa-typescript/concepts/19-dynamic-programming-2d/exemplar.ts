// Run: tsx exemplar.ts

export function uniquePaths(m: number, n: number): number {
  // Initialize all cells to 1 — first row and column are all 1
  const dp = Array.from({ length: m }, () => new Array<number>(n).fill(1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }
  return dp[m - 1][n - 1];
}

export function longestCommonSubsequence(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  // dp[i][j] = LCS length of s1[0..i-1] and s2[0..j-1]
  // Row and column 0 represent empty strings — initialized to 0
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function editDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  // dp[i][j] = min edits to convert s1[0..i-1] to s2[0..j-1]
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));

  // Base cases: converting to/from empty string
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // delete from s1
          dp[i][j - 1],     // insert into s1
          dp[i - 1][j - 1]  // replace
        );
      }
    }
  }
  return dp[m][n];
}
