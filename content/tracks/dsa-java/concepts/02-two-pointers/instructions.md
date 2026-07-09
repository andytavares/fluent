# Two Pointers

## What you'll learn

How to eliminate nested loops by maintaining two indices that scan an array or string from opposite ends or at different speeds — converting O(n²) brute force into O(n).

## Key concepts

Two pointers works when the structure of the problem lets you make a *greedy local decision* about which pointer to advance. That decision is what makes it provably correct at O(n) rather than O(n²).

### Pattern 1 — Opposite ends (palindrome check)

```java
int left = 0, right = s.length() - 1;
while (left < right) {
    // skip non-alphanumeric on both sides
    while (left < right && !Character.isLetterOrDigit(s.charAt(left)))  left++;
    while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
    if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
        return false;   // mismatch — cannot be a palindrome
    }
    left++;
    right--;
}
return true;
```

### Pattern 2 — Opposite ends, greedy shrink (container with most water)

```java
int left = 0, right = heights.length - 1, maxWater = 0;
while (left < right) {
    int water = Math.min(heights[left], heights[right]) * (right - left);
    maxWater = Math.max(maxWater, water);
    // Moving the taller pointer inward can only make things worse:
    // width shrinks AND the bottleneck is still the shorter side.
    if (heights[left] < heights[right]) left++;
    else right--;
}
return maxWater;
```

### Pattern 3 — Sort + opposite ends (three sum)

Finding all unique triplets that sum to zero. Sort first, then fix one element and run two-pointer on the remainder. Sorting also makes deduplication trivial — skip equal elements to avoid duplicates without a HashSet.

```java
Arrays.sort(nums);   // O(n log n) — enables two-pointer + dedup
List<List<Integer>> result = new ArrayList<>();
for (int i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue; // skip duplicate fixed element
    int left = i + 1, right = nums.length - 1;
    while (left < right) {
        int sum = nums[i] + nums[left] + nums[right];
        if (sum == 0) {
            result.add(List.of(nums[i], nums[left], nums[right]));
            while (left < right && nums[left]  == nums[left  + 1]) left++;  // skip dupes
            while (left < right && nums[right] == nums[right - 1]) right--; // skip dupes
            left++; right--;
        } else if (sum < 0) {
            left++;  // need a larger value
        } else {
            right--; // need a smaller value
        }
    }
}
return result;
```

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `isPalindrome` | O(n) | O(1) | Each pointer moves inward at most n/2 times |
| `containerWithMostWater` | O(n) | O(1) | Each pointer moves inward; total moves ≤ n |
| `threeSum` | O(n²) | O(1) aux | Sort O(n log n) + O(n) inner loop for each of n elements |

## Common variations this pattern solves

1. **Two Sum II (sorted array)** — opposite-end pointers, advance left if sum too small
2. **Remove Duplicates In-Place** — slow/fast pointer variant; fast scans ahead, slow writes
3. **Trapping Rain Water** — track left/right max, advance the smaller side
4. **Valid Palindrome II** — one allowed deletion; recurse into two sub-checks

## vs other languages

Coming from Python, `sorted()` returns a new list; `Arrays.sort(nums)` sorts **in place** and returns `void`. Forgetting the return value check is a common mistake.

Coming from JavaScript, `Character.isLetterOrDigit` and `Character.toLowerCase` live in `java.lang` — no import needed. In JS you'd use regex; in Java the `Character` static methods are idiomatic.

## Watch out

- **Integer overflow in `threeSum`**: `nums[i] + nums[left] + nums[right]` with three `int` values won't overflow for normal constraints (values ≤ 10^9 means max sum is 3×10^9 which overflows `int`). Cast to `long` if the problem allows values up to Integer.MAX_VALUE.
- **`==` vs `.equals()` on `Integer`**: the two-pointer comparison `nums[left] == nums[left + 1]` works fine on primitives but will break if you're comparing `Integer` objects. Always unbox first or use `.equals()`.
- **Dedup order in threeSum**: skip duplicates *before* incrementing `left`/`right`, not after — doing it after can skip valid triplets.
- **`Arrays.sort` on `int[]`** uses dual-pivot quicksort — O(n log n) average, O(n²) worst case (rare). On `Integer[]` it uses merge sort (stable). For interview purposes treat both as O(n log n).

## FAANG follow-up questions

> "Can you do threeSum in better than O(n²)?" — No general improvement is known for 3SUM; it's a well-studied problem with a conjectured Ω(n²) lower bound.
>
> "What if the array has no duplicates — does dedup logic still matter?" — No, but keeping it correct in all cases is required. Remove the `continue` guards and verify with a test.
>
> "How would you extend this to fourSum?" — Fix two elements (O(n²)) and two-pointer the rest (O(n)), giving O(n³) overall.
>
> "What's the tradeoff between sorting vs HashSet for threeSum?" — Sort + two-pointer is O(n²) time / O(1) space. HashSet approach is O(n²) time / O(n) space and harder to deduplicate correctly.

## The task

Implement three methods in `Solution`:

```java
// Returns true if s reads the same forward and backward.
// Consider only alphanumeric characters, case-insensitive.
// "A man, a plan, a canal: Panama" -> true
public static boolean isPalindrome(String s)

// Returns the maximum water trapped between any two vertical lines.
// heights[i] is the height of the line at position i.
// [1,8,6,2,5,4,8,3,7] -> 49
public static int containerWithMostWater(int[] heights)

// Returns all unique triplets [a, b, c] such that a + b + c == 0.
// The solution set must not contain duplicate triplets.
// [-1,0,1,2,-1,-4] -> [[-1,-1,2],[-1,0,1]]
public static List<List<Integer>> threeSum(int[] nums)
```
