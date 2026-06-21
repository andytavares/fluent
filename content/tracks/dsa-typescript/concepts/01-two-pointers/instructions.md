# Two Pointers

## What you'll learn

How to eliminate O(n²) nested loops by placing two index variables at strategic positions and marching them toward each other — or keeping one fast and one slow. You'll implement three problems: a palindrome check, container with most water, and 3Sum.

## Key concepts

### Opposite-end pattern

Place `left` at index 0 and `right` at `arr.length - 1`. Each iteration, you make a decision about which pointer to advance based on a comparison. The invariant: anything outside `[left, right]` has been ruled out.

```typescript
function twoPointerOpposite(arr: number[], target: number): boolean {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];

    if (sum === target) return true;        // found
    else if (sum < target) left++;          // need a larger value on the left
    else right--;                           // need a smaller value on the right
  }
  return false;
}
```

**Why it's O(n)**: each pointer only moves inward — the total steps across both pointers is at most n.

### Fast/slow pointer pattern

Two pointers move through the same sequence at different speeds. Classic uses: cycle detection, finding the middle of a linked list.

```typescript
// Floyd's cycle detection
function hasCycle<T>(head: Node<T> | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;          // moves 1 step
    fast = fast.next.next;      // moves 2 steps
    if (slow === fast) return true;
  }
  return false;
}
```

### 3Sum: sorted + two pointers per anchor

For problems requiring triplets, sort first, then fix one element and run two pointers on the remainder. Skip duplicates explicitly to avoid returning duplicate triplets.

```typescript
// Outer loop fixes nums[i]; inner two pointers find pairs summing to -nums[i].
// Sort first: O(n log n). Overall: O(n²).
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // skip duplicate anchors

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;   // skip dups
        while (left < right && nums[right] === nums[right - 1]) right--; // skip dups
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
```

## Complexity

| Problem | Time | Space | Notes |
|---------|------|-------|-------|
| `isPalindrome` | O(n) | O(1) | Compare chars inward after normalization |
| `containerWithMostWater` | O(n) | O(1) | Always advance the shorter-height pointer |
| `threeSum` | O(n²) | O(1) output excluded | Sort once, O(n) two-pointer pass per anchor |

## Common variations

- **Trapping Rain Water** — two pointers tracking left/right max heights
- **Two Sum II (sorted array)** — direct application of opposite-end pattern
- **Palindrome with at-most-one deletion** — variant where you allow one skip
- **Move zeros** — slow/fast variant where fast finds non-zero, slow places it

## vs other languages

In Python, the same logic applies but you'd write `left, right = 0, len(arr) - 1`. TypeScript forces you to think about `undefined` when indexing: `arr[left]` is typed `number` if `arr: number[]`, but at runtime an out-of-bounds access returns `undefined`. The loop condition `left < right` prevents this — make sure your termination condition is tight.

## Watch out

- **Off-by-one in 3Sum**: the outer loop should run to `nums.length - 2`, not `nums.length - 1`. With only two elements left for the inner window, you'd try `left === right` which the inner while handles — but the outer loop fires one iteration with a window of zero.
- **Duplicate skipping in 3Sum**: skip AFTER recording the triplet, not before. Skip `nums[left + 1]` (not `nums[left]`) since you already moved both pointers after pushing.
- **isPalindrome with all non-alphanumeric**: `".,!"` → the cleaned string is `""`, which is a palindrome. Return `true`.
- **TypeScript pitfall**: `string[i]` returns `string`, not `string | undefined` in the type system, even out of bounds. Rely on your loop guard, not the type.

## FAANG follow-up questions

> After implementing `threeSum`, interviewers commonly ask:
> - "What's the time complexity if the input has many duplicates?" (Still O(n²) worst case — the skipping is O(n) amortized.)
> - "How would you solve 4Sum?" (Add another outer loop, reduce to 3Sum per iteration — O(n³).)
> - "Can you do it in O(n) space?" (The current solution is O(1) ignoring output. If they ask about the sort, Timsort is O(n) space.)
> - "How does `containerWithMostWater` differ from `trappingRainWater`?" (Container: choose two walls. Trapping: water fills between all walls — requires tracking max from each side.)

## The task

Implement three functions:

```typescript
// Returns true if s is a palindrome, ignoring non-alphanumeric characters
// and treating upper/lower case as equal.
// "A man, a plan, a canal: Panama" → true
// "race a car" → false
// "" → true
function isPalindrome(s: string): boolean

// Given heights of vertical lines, return the maximum water area
// formed by choosing any two lines.
// [1,8,6,2,5,4,8,3,7] → 49
// [1,1] → 1
function containerWithMostWater(heights: number[]): number

// Return all unique triplets [a, b, c] from nums such that a + b + c === 0.
// nums = [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]
// No duplicate triplets in the output.
function threeSum(nums: number[]): number[][]
```
