# Stacks

## What you'll learn

Three stack patterns that cover the majority of FAANG stack questions: bracket matching, monotonic stack for next-greater-element problems, and the advanced monotonic stack for computing histogram areas.

## Key concepts

A stack's power in algorithms comes from its "last-in, first-out" memory: you keep track of pending decisions and resolve them in reverse order when new information arrives.

JavaScript arrays work as stacks: `push` to add, `pop` to remove, `at(-1)` to peek.

### Bracket matching

Push open brackets; on a closing bracket, verify the top matches.

```js
const matching = { ')': '(', '}': '{', ']': '[' };
const stack = [];
for (const c of s) {
  if ('({['.includes(c)) stack.push(c);
  else {
    if (!stack.length || stack.at(-1) !== matching[c]) return false;
    stack.pop();
  }
}
return stack.length === 0; // empty means all matched
```

### Monotonic stack — next greater element

Stack holds indices of elements whose "next greater" hasn't been found yet. When a larger element arrives, resolve all waiting elements.

```js
const result = new Array(temps.length).fill(0);
const stack = []; // indices, decreasing temperature order
for (let i = 0; i < temps.length; i++) {
  while (stack.length && temps[i] > temps[stack.at(-1)]) {
    const idx = stack.pop();
    result[idx] = i - idx; // days waited
  }
  stack.push(i);
}
// unresolved indices in stack have no warmer day (result already 0)
```

### Monotonic stack — largest rectangle in histogram

For each bar, find the nearest shorter bar to the left and right. The rectangle using that bar as height extends between those bounds.

```js
function largestRectangleInHistogram(heights) {
  const stack = []; // indices of bars in increasing height order
  let maxArea = 0;
  // Append sentinel 0 to flush all remaining bars at the end
  const h = [...heights, 0];
  for (let i = 0; i < h.length; i++) {
    while (stack.length && h[i] < h[stack.at(-1)]) {
      const height = h[stack.pop()];
      const width = stack.length ? i - stack.at(-1) - 1 : i;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }
  return maxArea;
}
```

The sentinel `0` at the end forces all remaining bars off the stack.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| isValidParentheses | O(n) | O(n) |
| dailyTemperatures | O(n) | O(n) |
| largestRectangleInHistogram | O(n) | O(n) |

Each element is pushed and popped at most once — that's the source of O(n) for all three.

## Common variations

- **Largest rectangle in a binary matrix** (LC 85) — apply histogram to each row of a binary matrix; O(m*n)
- **Next greater element I/II** (LC 496/503) — circular array version wraps the loop twice
- **Min stack** (LC 155) — maintain a parallel stack of running minimums; O(1) `getMin`
- **Evaluate reverse polish notation** (LC 150) — stack-based expression evaluation

## vs other languages

`Array.prototype.at(-1)` was added in ES2022 (Node 16.6+). For older environments use `stack[stack.length - 1]`. In Java you'd use `Deque<Integer> stack = new ArrayDeque<>()` and `stack.peek()`.

## FAANG follow-up questions

After largestRectangleInHistogram:
- "How would you extend this to a 2D binary matrix?" (treat each row as a histogram; run the O(n) algorithm on each row; O(m*n) overall)
- "Can you do it in O(n) without the sentinel?" (yes — handle the remaining stack after the loop, but the sentinel approach is cleaner)
- "What's the space complexity if all heights are strictly increasing?" (stack grows to O(n) — stack never empties until the sentinel)

After dailyTemperatures:
- "What if you want the actual temperature, not the days to wait?" (push values instead of indices; trivial change)
- "What if you want the previous cooler day?" (traverse right to left; flip the comparison)

## Watch out

- **largestRectangleInHistogram width calculation**: `width = stack.length ? i - stack.at(-1) - 1 : i`. When the stack is empty after popping, the bar extends all the way to index 0, so width = `i`.
- **Bracket matching**: check `stack.length === 0` before returning true. A string like `"((("` never pops anything — the stack isn't empty at the end.
- **Monotonic stack direction**: "next greater" uses a stack of decreasing values. "Previous smaller" requires a left-to-right pass with an increasing stack. Getting these backwards produces wrong results.
- **dailyTemperatures equal temperatures**: `temps[i] > temps[stack.at(-1)]` is strict greater-than. Equal temperatures do not resolve — which is correct (you wait for a *warmer* day, not equal).

## The task

### `isValidParentheses(s)`

Return `true` if the bracket string is valid.

```js
isValidParentheses("()")     // true
isValidParentheses("()[]{}")  // true
isValidParentheses("(]")      // false
isValidParentheses("{[]}")    // true
isValidParentheses("")        // true
```

### `dailyTemperatures(temps)`

Return an array where `result[i]` is the number of days until a warmer temperature. `0` if no warmer day exists.

```js
dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]) // [1, 1, 4, 2, 1, 1, 0, 0]
dailyTemperatures([30, 40, 50, 60])                  // [1, 1, 1, 0]
dailyTemperatures([30, 60, 90])                      // [1, 1, 0]
```

### `largestRectangleInHistogram(heights)`

Given an array of bar heights, find the largest rectangle that can be formed within the histogram. Return the area.

```js
largestRectangleInHistogram([2, 1, 5, 6, 2, 3]) // 10
largestRectangleInHistogram([2, 4])              // 4
largestRectangleInHistogram([1])                 // 1
largestRectangleInHistogram([0])                 // 0
```

Use a monotonic stack. Append a sentinel `0` to `heights` to flush all remaining bars at the end.
