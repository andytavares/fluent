# Stacks

## What you'll learn

How a LIFO stack enables O(n) solutions to problems that naively require O(n²) — especially the **monotonic stack** pattern, which keeps the stack sorted at all times by discarding dominated elements. You'll implement three problems: valid parentheses, daily temperatures, and largest rectangle in histogram.

## Key concepts

### Basic stack: bracket matching

Push open brackets. When you encounter a closing bracket, verify it matches the top of the stack.

```typescript
function isValidParentheses(s: string): boolean {
  const stack: string[] = [];
  const matching: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else {
      // Close bracket: stack must be non-empty AND top must match
      if (stack.length === 0 || stack[stack.length - 1] !== matching[ch]) {
        return false;
      }
      stack.pop();
    }
  }
  return stack.length === 0; // unclosed brackets fail
}
```

### Monotonic stack: next greater element

Maintain a stack of indices whose elements are strictly decreasing. When the current element exceeds the top, the current element is the "next greater" for the top.

```typescript
function dailyTemperatures(temps: number[]): number[] {
  const result = new Array<number>(temps.length).fill(0);
  const stack: number[] = []; // indices waiting for a warmer day

  for (let i = 0; i < temps.length; i++) {
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      result[idx] = i - idx; // days until warmer
    }
    stack.push(i);
    // Elements remaining in stack at end → no warmer day → result stays 0
  }
  return result;
}
```

**Why O(n)**: each index is pushed once and popped at most once. The inner while loop does O(n) total work across all iterations.

### Monotonic stack: largest rectangle in histogram

The key insight: for each bar, the largest rectangle it participates in extends left and right until it hits a shorter bar. A monotonic increasing stack tracks the nearest shorter bar on the left; when we pop, we know the nearest shorter bar on the right.

```typescript
function largestRectangleInHistogram(heights: number[]): number {
  const stack: number[] = []; // indices of bars in increasing height order
  let maxArea = 0;

  // Append a sentinel 0 to flush remaining stack entries at the end
  const h = [...heights, 0];

  for (let i = 0; i < h.length; i++) {
    while (stack.length > 0 && h[i] < h[stack[stack.length - 1]]) {
      const height = h[stack.pop()!];
      // Width: from stack's new top (exclusive) to current i (exclusive)
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }
  return maxArea;
}
```

**Worked example**: `heights = [2, 1, 5, 6, 2, 3]`
- When we hit `i=4` (height=2), we pop 6 (height=6, width=1=49–wait), then 5 (height=5, width=2), then stop because h[1]=1 < 2.
- The sentinel at the end forces remaining bars to be processed.

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `isValidParentheses` | O(n) | O(n) | Stack bounded by string length |
| `dailyTemperatures` | O(n) | O(n) | Each element pushed/popped once |
| `largestRectangleInHistogram` | O(n) | O(n) | Same push/pop argument |

## Common variations

- **Min stack** — stack that supports `push`, `pop`, and `getMin` in O(1) using a secondary "minimums" stack
- **Decode string** — stack-based string reconstruction (`3[a2[c]]` → `accaccacc`)
- **Asteroid collision** — simulate stack with signed integers
- **Remove k digits** — monotonic stack to build the smallest number

## vs other languages

TypeScript's `number[]` with `push`/`pop` is O(1) amortized — arrays grow by doubling. In Python, `list.append/pop()` is the same. Java uses `Deque<Integer>` (avoid legacy `Stack<>` which is synchronized). Go has no built-in stack; use a slice with `append` and `slice[len-1:]`.

## Watch out

- **`stack[stack.length - 1]`**: TypeScript types this as `string` (not `string | undefined`) for `string[]`. If the stack is empty, you'll get `undefined` at runtime even though the type says otherwise. Always guard with `stack.length > 0` before peeking.
- **`stack.pop()!`**: The `!` is safe because you just checked `stack.length > 0`. Without the guard, this returns `undefined` silently.
- **Width calculation in histogram**: when the stack is empty after popping, the rectangle extends all the way to the left edge — width is `i`, not `i - (-1) - 1`. The formula `stack.length === 0 ? i : i - stack[stack.length - 1] - 1` handles both cases.
- **Sentinel value**: appending `0` to heights forces all remaining bars to be processed. Without it, you need a second loop to drain the stack.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you solve `largestRectangleInHistogram` with divide and conquer?" (Find the minimum bar, it splits the histogram into two sub-problems. O(n log n) average, O(n²) worst case — the stack approach is preferred.)
> - "How does `largestRectangleInHistogram` relate to maximal rectangle in a binary matrix?" (Build a histogram row by row from the matrix and apply this function — O(m·n) total.)
> - "Can you implement a Min Stack?" (Keep a second `minStack` that pushes the current minimum each time. `getMin` peeks the `minStack`.)
> - "What's the space complexity if the input is already sorted ascending?" (`isValidParentheses`: still O(n) stack. `dailyTemperatures`: O(n) stack since nothing gets popped until the end.)

## The task

Implement three functions:

```typescript
// Return true if s contains only correctly matched brackets: (), [], {}.
// "()"     → true
// "()[]{}" → true
// "(]"     → false
// "([)]"   → false
// ""       → true
function isValidParentheses(s: string): boolean

// Return an array where result[i] = number of days until a warmer temperature.
// If no warmer day exists, use 0.
// [73,74,75,71,69,72,76,73] → [1,1,4,2,1,1,0,0]
function dailyTemperatures(temps: number[]): number[]

// Return the area of the largest rectangle in the histogram.
// Each bar has width 1.
// [2,1,5,6,2,3] → 10  (bars at indices 2 and 3: height 5, width 2)
// [2,4]         → 4
function largestRectangleInHistogram(heights: number[]): number
```
