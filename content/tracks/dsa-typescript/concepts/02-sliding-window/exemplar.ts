// Run: tsx exemplar.ts

export function longestUniqueSubstring(s: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];

    // Only jump left if the previous occurrence is inside the current window
    if (lastSeen.has(ch) && lastSeen.get(ch)! >= left) {
      left = lastSeen.get(ch)! + 1;
    }

    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

export function maxSumSubarray(nums: number[], k: number): number {
  if (nums.length < k) return 0;

  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i];

  let maxSum = windowSum;

  for (let right = k; right < nums.length; right++) {
    windowSum += nums[right] - nums[right - k]; // slide the window
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}

export function minWindowSubstring(s: string, t: string): string {
  if (s.length === 0 || t.length === 0) return "";

  // Count required characters from t
  const need = new Map<string, number>();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);

  const have = new Map<string, number>();
  let formed = 0;              // distinct chars in t whose count is satisfied
  const required = need.size;

  let left = 0;
  let minLen = Infinity;
  let minStart = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    have.set(ch, (have.get(ch) ?? 0) + 1);

    // Did adding ch fully satisfy its requirement?
    if (need.has(ch) && have.get(ch) === need.get(ch)) formed++;

    // Shrink from left while the window contains all required chars
    while (formed === required) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }
      const leftCh = s[left];
      have.set(leftCh, have.get(leftCh)! - 1);
      if (need.has(leftCh) && have.get(leftCh)! < need.get(leftCh)!) formed--;
      left++;
    }
  }

  return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}
