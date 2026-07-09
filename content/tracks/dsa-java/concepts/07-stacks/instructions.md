# Stacks

## What you'll learn

How to use a LIFO stack to process elements in reverse-encounter order, and how a monotonic stack resolves "next greater/smaller element" problems in O(n) — including the notoriously tricky largest rectangle in histogram.

## Key concepts

### Pattern 1 — Matching structure (Valid Parentheses)

Push opening brackets; on a closing bracket, pop and verify the match.

```java
var stack = new ArrayDeque<Character>();
for (char c : s.toCharArray()) {
    if (c == '(' || c == '[' || c == '{') {
        stack.push(c);
    } else {
        if (stack.isEmpty()) return false;
        char top = stack.pop();
        if (c == ')' && top != '(') return false;
        if (c == ']' && top != '[') return false;
        if (c == '}' && top != '{') return false;
    }
}
return stack.isEmpty(); // unmatched opens would remain
```

### Pattern 2 — Monotonic stack (Daily Temperatures)

A monotonic decreasing stack holds indices of unresolved days. When a warmer day arrives, it resolves all colder days below it.

```java
int n = temps.length;
int[] result = new int[n];
var stack = new ArrayDeque<Integer>(); // indices
for (int i = 0; i < n; i++) {
    while (!stack.isEmpty() && temps[i] > temps[stack.peek()]) {
        int idx = stack.pop();
        result[idx] = i - idx; // distance to next warmer day
    }
    stack.push(i);
}
return result; // remaining stack indices have no warmer future day -> stays 0
```

Each element is pushed and popped at most once: amortized O(1) per element.

### Pattern 3 — Monotonic stack with sentinel (Largest Rectangle in Histogram)

Extend the histogram with a sentinel bar of height 0 at the end to flush all remaining bars from the stack. For each bar popped, its width is bounded by the current index on the right and the new top of the stack on the left.

```java
var stack = new ArrayDeque<Integer>(); // indices of bars in increasing height order
stack.push(-1); // sentinel for left boundary

int maxArea = 0;
int[] extended = Arrays.copyOf(heights, heights.length + 1); // add trailing 0

for (int i = 0; i < extended.length; i++) {
    while (stack.peek() != -1 && extended[i] < extended[stack.peek()]) {
        int h = extended[stack.pop()];
        int w = i - stack.peek() - 1; // width between left sentinel and i
        maxArea = Math.max(maxArea, h * w);
    }
    stack.push(i);
}
return maxArea;
```

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `isValidParentheses` | O(n) | O(n) | Each char processed once; stack ≤ n |
| `dailyTemperatures` | O(n) | O(n) | Each index pushed/popped at most once |
| `largestRectangleInHistogram` | O(n) | O(n) | Each bar pushed/popped at most once |

## Common variations this pattern solves

1. **Next Greater Element** — monotonic decreasing stack; process backwards or use a map
2. **Trapping Rain Water** — monotonic stack or two-pointer; water trapped per bar
3. **Asteroid Collision** — stack-based simulation; process collisions in order
4. **Score of Parentheses** — stack tracks nested depth; `2^depth` at each matched pair

## vs other languages

Python uses a plain `list` as a stack (`append`/`pop`). Java's `java.util.Stack` is synchronized (extends `Vector`) — always prefer `ArrayDeque`. `ArrayDeque.push`/`pop`/`peek` give the same LIFO semantics without the synchronization overhead.

## Watch out

- **Never use `java.util.Stack`** in new code. It's a historical accident (`extends Vector`). `ArrayDeque<T>` is the replacement.
- **`stack.peek()` on empty deque throws `NoSuchElementException`**. Always check `!stack.isEmpty()` before peeking. Alternatively, `peekFirst()` returns `null` on empty.
- **Sentinel `-1` in histogram**: the sentinel left boundary `stack.push(-1)` avoids a special case for bars that span the full width. Without it you'd need `w = i` for bars with no left neighbor.
- **`Arrays.copyOf` extends with zeros**: the trailing sentinel 0 guarantees all bars are flushed. Without it, bars remaining on the stack after the main loop need a second pass.

## FAANG follow-up questions

> "Can largestRectangleInHistogram be done in O(n log n) without a stack?" — Yes, using a divide-and-conquer approach (find minimum bar, recurse left and right). O(n log n) average, O(n²) worst case. The stack solution is strictly better.
>
> "How does the histogram solution extend to maximal rectangle in a binary matrix?" — Treat each row as the base of a histogram and apply largestRectangleInHistogram per row. O(m·n) total.
>
> "What if isValidParentheses had wildcards ('*' can match '(', ')' or empty)?" — Use two counters (lo/hi) to track the range of possible open-bracket counts. If `hi < 0` at any point, invalid.
>
> "Why store indices rather than values in the monotonic stack?" — You need the index to compute distances (dailyTemperatures) or widths (histogram). The value is recoverable from the index.

## The task

Implement three methods in `Solution`:

```java
// Returns true if every opening bracket has a matching close in correct order.
// "([]{})" -> true, "([)]" -> false, "" -> true
public static boolean isValidParentheses(String s)

// Returns result[] where result[i] = days until a warmer temperature.
// If no warmer day exists, result[i] = 0.
// [73,74,75,71,69,72,76,73] -> [1,1,4,2,1,1,0,0]
public static int[] dailyTemperatures(int[] temps)

// Returns the area of the largest rectangle that fits in the histogram.
// [2,1,5,6,2,3] -> 10 (rectangle of height 5, width 2 at indices 2-3)
public static int largestRectangleInHistogram(int[] heights)
```
