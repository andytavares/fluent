# Stacks

## What you'll learn

How a stack's LIFO property lets you defer decisions until future context arrives, why the **monotonic stack** is the key interview pattern, and how it solves histogram area in O(n) — a problem that looks like it needs O(n²).

## Key concepts

**Python's list is the canonical stack.** `.append()` to push, `.pop()` to pop, `[-1]` to peek. All O(1) amortized. No `Stack` class needed.

### Valid parentheses — push/pop matching

```python
def is_valid_parentheses(s: str) -> bool:
    stack: list[str] = []
    matching = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        else:
            if not stack or stack[-1] != matching[ch]:
                return False
            stack.pop()
    return len(stack) == 0
```

### Monotonic stack — daily temperatures

Maintain a **decreasing stack of indices**. When the current temperature is warmer than the top, the top has found its answer.

```python
def daily_temperatures(temps: list[int]) -> list[int]:
    result = [0] * len(temps)
    stack: list[int] = []          # indices; temps[stack[-1]] is smallest waiting
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            result[j] = i - j      # days until warmer
        stack.append(i)
    return result
```

Each index is pushed once and popped once → O(n) total.

### Largest rectangle in histogram — monotonic stack for area

The key insight: the maximum rectangle using bar `i` as the **shortest** bar extends left to the first bar shorter than `i` (exclusive) and right to the first bar shorter than `i` (exclusive). Use a monotonic increasing stack to track this.

```python
def largest_rectangle_in_histogram(heights: list[int]) -> int:
    stack: list[int] = []          # indices of increasing heights
    max_area = 0
    # Append a sentinel 0 to flush all bars at the end
    for i, h in enumerate(heights + [0]):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            # Width: from the new stack top (exclusive) to i (exclusive)
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)
    return max_area
```

**Walking through `[2,1,5,6,2,3]`:**
- Process bars in order. When bar `i` is shorter than stack top, pop the top and calculate area using `i` as the right boundary and the new stack top as the left boundary.
- The `+ [0]` sentinel ensures all remaining bars on the stack are processed.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Valid parentheses | O(n) | O(n) |
| Daily temperatures | O(n) | O(n) |
| Largest rectangle | O(n) | O(n) |

## Common variations

- **Next Greater Element I/II** — monotonic decreasing stack; circular array needs index modulo
- **Asteroid Collision** — stack simulates collisions; stable elements stay on stack
- **Decode String** — stack holds (count, accumulated_string) pairs for nested brackets
- **Basic Calculator** — stack for operator precedence and nested expressions

## vs other languages

Python `list.pop()` with no argument pops from the right (top of stack) — O(1). Java's `Deque<Integer> stack = new ArrayDeque<>()` is the modern recommendation over `java.util.Stack` (which is synchronized). C++'s `std::stack` defaults to `deque` underneath. In Python you never need to import anything for basic stack use.

## Watch out

- **Monotonic stacks store indices, not values** — you need the index to compute distances (width in histogram, days in temperatures).
- **The sentinel value in histogram:** appending `heights + [0]` (a sentinel shorter than any bar) flushes all remaining stack elements. Without it, bars that were never popped would not contribute to `max_area`.
- **`not stack` before `stack[-1]`** — always check that the stack is non-empty before peeking. An empty stack raises `IndexError`.
- **Width calculation in histogram:** when `stack` is empty after popping, the popped bar was the global minimum up to `i`, so width spans from index 0 to `i-1` → `width = i`. When `stack` is non-empty, width is `i - stack[-1] - 1`.

## FAANG follow-up questions

> "Can you do largest rectangle in O(n) without a stack?" — Divide and conquer gives O(n log n). The stack solution is O(n) and is the expected approach.

> "What about maximum rectangle in a binary matrix?" — Treat each row as the base of a histogram (cumulative column heights). Apply `largest_rectangle_in_histogram` to each row: O(m·n).

> "How does the monotonic stack relate to the 'next smaller element' problem?" — They're the same algorithm. Daily temperatures finds "next greater"; to find "next smaller" you maintain an increasing stack and pop when the current element is smaller.

## The task

```python
def is_valid_parentheses(s: str) -> bool:
    """Return True if every open bracket has a matching close bracket
    in the correct order. Valid bracket pairs: (), [], {}."""

def daily_temperatures(temps: list[int]) -> list[int]:
    """For each day i, return how many days until a warmer temperature.
    Return 0 for days with no warmer future day."""

def largest_rectangle_in_histogram(heights: list[int]) -> int:
    """Given heights of bars in a histogram (each bar has width 1),
    return the area of the largest rectangle that fits within the histogram."""
```

**Examples:**
- `is_valid_parentheses("()[]{}")` → `True`
- `is_valid_parentheses("([)]")` → `False`
- `daily_temperatures([73,74,75,71,69,72,76,73])` → `[1,1,4,2,1,1,0,0]`
- `largest_rectangle_in_histogram([2,1,5,6,2,3])` → `10`
- `largest_rectangle_in_histogram([2,4])` → `4`
- `largest_rectangle_in_histogram([1])` → `1`
