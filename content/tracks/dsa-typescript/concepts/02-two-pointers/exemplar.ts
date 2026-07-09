// Run: tsx exemplar.ts

/**
 * Returns true if s is a palindrome, ignoring non-alphanumeric chars and case.
 * Skips junk characters with the pointers themselves — no cleaned copy.
 * O(n) time, O(1) space.
 */
function isPalindrome(s: string): boolean {
  const isAlnum = (c: string) => /[a-zA-Z0-9]/.test(c);
  let left = 0, right = s.length - 1;
  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}

/**
 * Returns the 1-based indexes [i, j] of the pair summing to target.
 * Sorted input makes one comparison per step decisive: a too-small sum can
 * only be fixed by advancing left, a too-large one by retreating right.
 * O(n) time, O(1) space.
 * @param numbers sorted ascending, exactly one solution
 */
function twoSumII(numbers: number[], target: number): number[] {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return []; // unreachable given the "exactly one solution" guarantee
}

/**
 * Returns the maximum water area between any two lines.
 * Move the shorter-line pointer inward — the shorter line caps the area of
 * every container it could form inside the current window.
 * O(n) time, O(1) space.
 */
function containerWithMostWater(heights: number[]): number {
  let left = 0, right = heights.length - 1;
  let maxArea = 0;
  while (left < right) {
    const area = Math.min(heights[left], heights[right]) * (right - left);
    maxArea = Math.max(maxArea, area);
    if (heights[left] <= heights[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxArea;
}

/**
 * Returns all unique triplets of values that sum to zero.
 * Sort, fix a pivot, run converging pointers on the rest. Duplicate skips
 * at the pivot and both inner pointers guarantee uniqueness without a set.
 * O(n²) time, O(1) auxiliary space (output excluded).
 */
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // skip duplicate pivots
    if (nums[i] > 0) break; // three positives can't sum to zero

    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

export { isPalindrome, twoSumII, containerWithMostWater, threeSum };

function main() {
  console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
  console.log(JSON.stringify(twoSumII([2, 7, 11, 15], 9))); // [1,2]
  console.log(containerWithMostWater([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
  console.log(JSON.stringify(threeSum([-1, 0, 1, 2, -1, -4]))); // [[-1,-1,2],[-1,0,1]]
}

main();
