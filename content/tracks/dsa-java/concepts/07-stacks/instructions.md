## What you build

You write `isValid`, a `MinStack` class and `evalRPN`. A stack remembers pending work and returns it in the reverse order you deferred it. That one idea solves bracket matching, path reduction, O(1) aggregates, postfix evaluation and nested context. This lesson builds on **Intervals**.

## Key concepts

### An `ArrayDeque` is a Java stack

`push` and `pop` on an `ArrayDeque` cost amortized O(1), and both work on the same end. Peek with `stack.peek()`. Test for an empty stack with `stack.isEmpty()`. Do not use the legacy `Stack` class, because it extends `Vector` and synchronizes every call.

```java
Deque<Integer> stack =
  new ArrayDeque<>();
stack.push(x);
// Peek.
int top = stack.peek();
// Pop returns the removed value.
stack.pop();
```

### Push openers, pop on closers

Any properly nested delimiters follow one rule. An opener defers an obligation. A closer must discharge the most recent open obligation, which is exactly LIFO order.

```java
Map<Character, Character> openerFor =
  Map.of(')', '(', ']', '[', '}', '{');
Deque<Character> stack =
  new ArrayDeque<>();
for (char c : s.toCharArray()) {
  if (c == '(' || c == '[' ||
      c == '{') {
    stack.push(c);
  } else if (stack.isEmpty() ||
      stack.pop() != openerFor.get(c)
        .charValue()) {
    // Wrong or missing opener.
    return false;
  }
}
// Leftover openers mean false.
return stack.isEmpty();
```

The last lines catch two separate failures. A closer with no opener fails the `isEmpty()` check, and a wrong one makes `pop()` return the wrong bracket. Openers left at the end fail the final `isEmpty()`.

### Store the aggregate with each entry

To answer "what is the minimum now?" in O(1), store the answer with each entry at push time. Each slot holds `[value, minSoFar]`. A pop restores the previous minimum, because it lives one slot down.

```java
void push(int val) {
  int min = stack.isEmpty()
    ? val
    : Math.min(val, getMin());
  stack.push(new int[]{val, min});
}
int getMin() {
  return stack.peek()[1];
}
```

The idea generalizes. You can snapshot any running aggregate (min, max, sum) per entry. That buys O(1) queries for O(n) extra space.

### Postfix operands wait on the stack

Reverse Polish Notation needs no parentheses and no precedence. Operands go on the stack. An operator pops its two operands, applies itself and pushes the result. Pop order matters: the second pop is the left operand.

```java
// Right operand: pushed last.
int b = stack.pop();
// Left operand.
int a = stack.pop();
// a op b, not b op a.
stack.push(apply(op, a, b));
```

Swapped `a` and `b` give the right answer for `+` and `*`, and the wrong one for `-` and `/`. Test with subtraction first.

### Save and restore context around nesting

For a nested expression like `1 - (2 + 3)`, a stack holds the suspended outer computation while you evaluate the inside. On `(`, push the running result and the pending sign, then reset them. On `)`, pop them back and fold in the inner result. This is the call-stack pattern, because it is a call stack.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Valid Parentheses | O(n) | O(n) | push openers, pop on closers |
| Min Stack | O(1) per op | O(n) | aggregate stored per entry |
| Evaluate RPN | O(n) | O(n) | operand stack |

## Watch out

- In RPN, the first pop is the right operand. `["7","3","-"]` is `7 - 3 = 4`.
- Swapped operands give `-4`, and they still pass every `+` and `*` test.
- Division truncates toward zero, not toward −∞. Java `int` division already does this, so use plain `a / b`.
- `-7 / 3` is `-2` in Java. `Math.floorDiv(-7, 3)` is `-3`, which is wrong here.
- Valid Parentheses has two failures. `"("` leaves the stack non-empty. `")"` finds nothing to pop. Check both.
- `ArrayDeque.pop()` on an empty deque throws `NoSuchElementException`. Check `isEmpty()` before each pop.
- A Min Stack `pop` must restore the previous minimum. A single `min` variable breaks when you pop the minimum.
- Store the minimum per entry, or in a parallel stack.
- Watch duplicate minimums. After push 2, push 2, pop, `getMin()` must still be 2.
- Per-entry snapshots handle duplicates for free. A parallel stack must push on ties (`val <= currentMin`).
- RPN tokens are strings. `"-11"` is a negative operand, not an operator.
- Match `token.equals("-")` exactly, then convert operands with `Integer.parseInt(token)`.

## Problem walkthroughs

### Valid Parentheses ★

**Problem.** A string holds only the characters `()[]{}`. Return `true` if the matching closer closes every opener in properly nested order.

**Example.**

```text
"()[]{}" -> true
"(]"     -> false
"([)]"   -> false
"{[]}"   -> true
```

**Steps.**
1. Build a map from closer to opener: `Map.of(')', '(', ']', '[', '}', '{')`.
2. Walk the string. Push every opener.
3. On a closer, pop and compare with the required opener. A mismatch means `false`. So does an empty stack, which you check with `isEmpty()` before the pop.
4. After the walk, return `stack.isEmpty()`. Openers left over, as in `"(("`, are the second failure.
5. LIFO is the whole proof. Proper nesting means the most recent opener must close first.

**Complexity.** O(n) time / O(n) space in the worst case (all openers).

### Simplify Path

**Problem.** Given an absolute Unix path that starts with `/`, return its canonical form. Drop `.` segments. A `..` segment pops one directory. Remove repeated and trailing slashes. The result starts with `/`, and `..` at the root stays at the root.

**Example.**

```text
"/home//foo/"    -> "/home/foo"
"/a/./b/../../c" -> "/c"
"/../"           -> "/"
```

**Steps.**
1. Call `path.split("/")`. Empty strings, from `//` and the outer slashes, do nothing. `"."` segments do nothing too. Skip them.
2. Keep a `Deque<String>` of real directory names. On `".."`, pop. A pop on an empty stack does nothing, because you cannot go above the root. Push every other segment.
3. Read the deque from bottom to top, with `descendingIterator()`, and join the names after a leading `"/"`. An empty stack gives `"/"`.
4. The stack is the working directory. Each `..` undoes the most recent `cd`, which is LIFO by definition.

**Complexity.** O(n) time / O(n) space.

### Min Stack ★

**Problem.** Design a stack with `push(val)`, `pop()`, `top()` and `getMin()`. `getMin()` returns the smallest value in the stack. All four run in O(1) time.

**Example.**

```text
push(-2), push(0), push(-3)
getMin() -> -3
pop()
top()    -> 0
getMin() -> -2
```

**Steps.**
1. Store entries as `int[]{value, minSoFar}` pairs in one `Deque<int[]>`.
2. `push(val)`: the new minimum is `val` if the stack is empty, else `Math.min(val, getMin())`. Push the pair.
3. `pop()`: pop the pair. The previous entry's snapshot is the restored minimum, with no recompute.
4. `top()` and `getMin()`: read the value or the minimum of the top pair.
5. A single `min` variable fails. After a pop of the minimum, you must scan again for the next smallest, which is O(n). The per-entry snapshot pays for that answer at push time.

**Complexity.** O(1) time per operation / O(n) space (one extra number per entry).

### Evaluate Reverse Polish Notation ★

**Problem.** Evaluate an arithmetic expression given as an array of postfix (RPN) tokens. A token is an integer string, which can be negative, or one of `+ - * /`. Division truncates toward zero. The expression is valid, and every intermediate value fits in 32 bits.

**Example.**

```text
["2","1","+","3","*"]  -> 9
((2 + 1) * 3)
["4","13","5","/","+"] -> 6
(4 + 13/5)
```

**Steps.**
1. Walk the tokens with a number stack.
2. For an operand token, call `stack.push(Integer.parseInt(token))`.
3. For an operator token, pop `b` (right) and pop `a` (left). Push `a op b`. For `/`, plain `a / b` already truncates toward zero.
4. The single value left on the stack is the answer.
5. Postfix fits a stack, because an operator always arrives after both its operands. They sit on top, in order.

**Complexity.** O(n) time / O(n) space.

### Basic Calculator

**Problem.** Evaluate a string expression with digits, `+`, `-`, parentheses and spaces. A unary minus appears only where an operand goes, for example `"-(3+4)"`. Return the integer value.

**Example.**

```text
"1 + 1"               -> 2
" 2-1 + 2 "           -> 3
"(1+(4+5+2)-3)+(6+8)" -> 23
```

**Steps.**
1. Scan left to right with three registers. `result` holds the value so far at this depth. `sign` is the pending +1 or −1 for the next operand. The third register is a stack.
2. For digits, read the full number with all its digits, then set `result += sign * number`.
3. For `+` or `-`, set `sign` to +1 or −1. Skip spaces.
4. On `(`, push `result` and `sign` onto the stack. Then reset `result = 0` and `sign = 1`, because a new sub-expression starts.
5. On `)`, finish the sub-expression, then restore: `result = poppedResult + poppedSign * result`.
6. The stack holds suspended outer contexts, like call frames. The nesting depth equals the stack height.

**Complexity.** O(n) time / O(d) space for nesting depth d.

## Interview follow-ups

- After **Valid Parentheses**: "Longest valid parentheses substring?" Use a stack of indexes, or counts in two directions. "Fewest insertions to balance?" Track unmatched openers and needed closers, in O(1) space.
- After **Min Stack**: "Can you avoid the extra number per element?" Store deltas against the running minimum in one stack, and discuss the overflow risk. "Max Stack with popMax?" Use two stacks with lazy deletion, or a doubly linked list with an ordered map.
- After **Evaluate RPN**: "Convert infix to RPN?" Use shunting-yard: an operator stack ordered by precedence. "Why does RPN need no parentheses?" Operator position encodes the tree shape.
- After **Basic Calculator**: "Add `*` and `/` (Basic Calculator II)?" Keep a `last` term. Multiply or divide into it before it joins the sum.

## The task

You write two functions and one class. The complexity limits are part of the task.

1. `boolean isValid(String s)` takes a string of only the six characters `(`, `)`, `[`, `]`, `{` and `}`.
2. It returns `true` when the same bracket type closes every opener, in properly nested (LIFO) order.
3. An empty string is valid. Use O(n) time.
4. `MinStack` is a static nested class. `new MinStack()` creates an empty stack of `int` values. Each method runs in O(1).
5. `void push(int val)` pushes `val` onto the stack.
6. `void pop()` removes the top element. Callers use it only on a non-empty stack.
7. `int top()` returns the top element and does not remove it. Callers use it only on a non-empty stack.
8. `int getMin()` returns the smallest value in the stack. Callers use it only on a non-empty stack.
9. A `getMin` that scans the stack is O(n) and fails the task. Separate instances do not share state.
10. `int evalRPN(String[] tokens)` evaluates a valid expression in Reverse Polish (postfix) notation. It returns the final number.
11. Each token is an integer string, or one of `"+"`, `"-"`, `"*"` and `"/"`. An integer string can be negative, like `"-11"`.
12. An operator applies to the two most recent values, left operand first. So `["7", "3", "-"]` is `7 - 3`.
13. Division truncates toward zero: `6 / -4` gives `-1`, not `-2`.
14. Operands and every intermediate result fit in 32 bits. Use O(n) time.

Edge cases:

- `isValid`: an empty string is `true`. A single opener or a single closer is `false`.
- `isValid`: correct types in the wrong nesting, as in `"([)]"`, are `false`. Handle deep nesting.
- `MinStack`: when you pop the minimum, the previous minimum must come back.
- `MinStack`: push 2 twice, then pop once, and `getMin()` stays 2. Handle negative values and mixed push and pop sequences.
- `evalRPN`: handle a single token. `"-11"` is a number, not an operator.
- `evalRPN`: operand order matters for `-` and `/`. A negative quotient truncates toward zero.

```java
isValid("()");      // true
isValid("()[]{}");  // true
isValid("(]");      // false
isValid("([)]");    // false
isValid("{[]}");    // true
isValid("(");       // false
isValid(")");       // false
isValid("");        // true

MinStack st = new MinStack();
st.push(-2);
st.push(0);
st.push(-3);
st.getMin();  // -3
st.pop();
st.top();     // 0
st.getMin();  // -2

evalRPN(new String[]{"2", "1", "+",
  "3", "*"});  // 9
evalRPN(new String[]{"4", "13", "5",
  "/", "+"});  // 6
evalRPN(new String[]{"18"});  // 18
evalRPN(new String[]{"7", "3", "-"});
// 4
evalRPN(new String[]{"-11", "5", "+"});
// -6
evalRPN(new String[]{"-7", "3", "/"});
// -2
evalRPN(new String[]{"6", "-4", "/"});
// -1
evalRPN(new String[]{"10", "6", "9",
  "3", "+", "-11", "*", "/", "*", "17",
  "+", "5", "+"});  // 22
```
