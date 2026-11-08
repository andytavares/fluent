## What you build

You write `is_valid`, a `MinStack` class and `eval_rpn`. A stack remembers pending work and returns it in the reverse order you deferred it. That one idea solves bracket matching, path reduction, O(1) aggregates, postfix evaluation and nested context. This lesson builds on **Intervals**.

## Key concepts

### A Python list is a stack

`append` and `pop()` on a list cost amortized O(1), and both work on the same end. Peek with `stack[-1]`. Test for an empty stack with `not stack`. Never use `insert(0, x)` or `pop(0)` for stack work, because they cost O(n).

```python
stack = []
stack.append(x)
# Peek.
top = stack[-1]
# Pop returns the removed value.
stack.pop()
```

### Push openers, pop on closers

Any properly nested delimiters follow one rule. An opener defers an obligation. A closer must discharge the most recent open obligation, which is exactly LIFO order.

```python
opener_for = {")": "(", "]": "[",
              "}": "{"}
for c in s:
    if c in "([{":
        stack.append(c)
    elif (not stack or
          stack.pop() != opener_for[c]):
        # Wrong or missing opener.
        return False
# Leftover openers mean False.
return not stack
```

The last lines catch two separate failures. A closer with no opener finds an empty stack, and a closer with the wrong opener pops the wrong bracket. Openers left at the end fail the `not stack` check.

### Store the aggregate with each entry

To answer "what is the minimum now?" in O(1), store the answer with each entry at push time. Each slot holds `(value, min_so_far)`. A pop restores the previous minimum, because it lives one slot down.

```python
def push(self, val):
    m = (val if not self.entries
         else min(val, self.get_min()))
    self.entries.append((val, m))

def get_min(self):
    return self.entries[-1][1]
```

The idea generalizes. You can snapshot any running aggregate (min, max, sum) per entry. That buys O(1) queries for O(n) extra space.

### Postfix operands wait on the stack

Reverse Polish Notation needs no parentheses and no precedence. Operands go on the stack. An operator pops its two operands, applies itself and pushes the result. Pop order matters: the second pop is the left operand.

```python
# Right operand: pushed last.
b = stack.pop()
# Left operand.
a = stack.pop()
# a op b, not b op a.
stack.append(apply(op, a, b))
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
- Division truncates toward zero, not toward −∞. Use `int(a / b)`, never `a // b`.
- `int(-7 / 3)` is `-2`, but `-7 // 3` is `-3`.
- Valid Parentheses has two failures. `"("` leaves the stack non-empty. `")"` finds nothing to pop. Check both.
- `pop()` on an empty list raises `IndexError`. Check `not stack` before you pop.
- A Min Stack `pop` must restore the previous minimum. A single `min` variable breaks when you pop the minimum.
- Store the minimum per entry, or in a parallel stack.
- Watch duplicate minimums. After push 2, push 2, pop, `get_min()` must still be 2.
- Per-entry snapshots handle duplicates for free. A parallel stack must push on ties (`val <= current_min`).
- RPN tokens are strings. `"-11"` is a negative operand, not an operator.
- Match `token == "-"` exactly, then convert operands with `int(token)`.

## Problem walkthroughs

### Valid Parentheses ★

**Problem.** A string holds only the characters `()[]{}`. Return `True` if the matching closer closes every opener in properly nested order.

**Example.**

```text
"()[]{}" -> True
"(]"     -> False
"([)]"   -> False
"{[]}"   -> True
```

**Steps.**
1. Build a dict from closer to opener: `{")": "(", "]": "[", "}": "{"}`.
2. Walk the string. Push every opener.
3. On a closer, pop and compare with the required opener. A mismatch means `False`. So does an empty stack, which you check before the pop.
4. After the walk, return `not stack`. Openers left over, as in `"(("`, are the second failure.
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
2. Keep a stack of real directory names. On `".."`, pop. A pop on an empty stack does nothing, because you cannot go above the root. Push every other segment.
3. Return `"/" + "/".join(stack)`. An empty stack gives `"/"`.
4. The stack is the working directory. Each `..` undoes the most recent `cd`, which is LIFO by definition.

**Complexity.** O(n) time / O(n) space.

### Min Stack ★

**Problem.** Design a stack with `push(val)`, `pop()`, `top()` and `get_min()`. `get_min()` returns the smallest value in the stack. All four run in O(1) time.

**Example.**

```text
push(-2), push(0), push(-3)
get_min() -> -3
pop()
top()     -> 0
get_min() -> -2
```

**Steps.**
1. Store entries as `(value, min_so_far)` tuples in one list.
2. `push(val)`: the new minimum is `val` if the stack is empty, else `min(val, self.get_min())`. Push the tuple.
3. `pop()`: pop the tuple. The previous entry's snapshot is the restored minimum, with no recompute.
4. `top()` and `get_min()`: read the value or the minimum of the top tuple.
5. A single `min` variable fails. After a pop of the minimum, you must scan again for the next smallest, which is O(n). The per-entry snapshot pays for that answer at push time.

**Complexity.** O(1) time per operation / O(n) space (one extra number per entry).

### Evaluate Reverse Polish Notation ★

**Problem.** Evaluate an arithmetic expression given as a list of postfix (RPN) tokens. A token is an integer string, which can be negative, or one of `+ - * /`. Division truncates toward zero. The expression is valid, and every intermediate value fits in 32 bits.

**Example.**

```text
["2","1","+","3","*"]  -> 9
((2 + 1) * 3)
["4","13","5","/","+"] -> 6
(4 + 13/5)
```

**Steps.**
1. Walk the tokens with a number stack.
2. For an operand token, call `stack.append(int(token))`.
3. For an operator token, pop `b` (right) and pop `a` (left). Push `a op b`. For `/`, push `int(a / b)`.
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
5. On `)`, finish the sub-expression, then restore: `result = popped_result + popped_sign * result`.
6. The stack holds suspended outer contexts, like call frames. The nesting depth equals the stack height.

**Complexity.** O(n) time / O(d) space for nesting depth d.

## Interview follow-ups

- After **Valid Parentheses**: "Longest valid parentheses substring?" Use a stack of indexes, or counts in two directions. "Fewest insertions to balance?" Track unmatched openers and needed closers, in O(1) space.
- After **Min Stack**: "Can you avoid the extra number per element?" Store deltas against the running minimum in one stack, and discuss the overflow risk. "Max Stack with popMax?" Use two stacks with lazy deletion, or a doubly linked list with an ordered map.
- After **Evaluate RPN**: "Convert infix to RPN?" Use shunting-yard: an operator stack ordered by precedence. "Why does RPN need no parentheses?" Operator position encodes the tree shape.
- After **Basic Calculator**: "Add `*` and `/` (Basic Calculator II)?" Keep a `last` term. Multiply or divide into it before it joins the sum.

## The task

You write two functions and one class. The complexity limits are part of the task.

1. `is_valid(s: str) -> bool` takes a string of only the six characters `(`, `)`, `[`, `]`, `{` and `}`.
2. It returns `True` when the same bracket type closes every opener, in properly nested (LIFO) order.
3. An empty string is valid. Use O(n) time.
4. `MinStack` is a class. `MinStack()` creates an empty stack of numbers. Each method runs in O(1).
5. `push(val: int) -> None` pushes `val` onto the stack.
6. `pop() -> None` removes the top element. Callers use it only on a non-empty stack.
7. `top() -> int` returns the top element and does not remove it. Callers use it only on a non-empty stack.
8. `get_min() -> int` returns the smallest value in the stack. Callers use it only on a non-empty stack.
9. A `get_min` that scans the stack is O(n) and fails the task. Separate instances do not share state.
10. `eval_rpn(tokens: list[str]) -> int` evaluates a valid expression in Reverse Polish (postfix) notation. It returns the final number.
11. Each token is an integer string, or one of `"+"`, `"-"`, `"*"` and `"/"`. An integer string can be negative, like `"-11"`.
12. An operator applies to the two most recent values, left operand first. So `["7", "3", "-"]` is `7 - 3`.
13. Division truncates toward zero: `-7 / 3` gives `-2`, not `-3`.
14. Operands and every intermediate result fit in 32 bits. Use O(n) time.

Edge cases:

- `is_valid`: an empty string is `True`. A single opener or a single closer is `False`.
- `is_valid`: correct types in the wrong nesting, as in `"([)]"`, are `False`. Handle deep nesting.
- `MinStack`: when you pop the minimum, the previous minimum must come back.
- `MinStack`: push 2 twice, then pop once, and `get_min()` stays 2. Handle negative values and mixed push and pop sequences.
- `eval_rpn`: handle a single token. `"-11"` is a number, not an operator.
- `eval_rpn`: operand order matters for `-` and `/`. A negative quotient truncates toward zero.

```python
is_valid("()")      # True
is_valid("()[]{}")  # True
is_valid("(]")      # False
is_valid("([)]")    # False
is_valid("{[]}")    # True
is_valid("(")       # False
is_valid(")")       # False
is_valid("")        # True

st = MinStack()
st.push(-2)
st.push(0)
st.push(-3)
st.get_min()  # -3
st.pop()
st.top()      # 0
st.get_min()  # -2

eval_rpn(["2", "1", "+", "3", "*"])  # 9
eval_rpn(["4", "13", "5", "/", "+"]) # 6
eval_rpn(["18"])                     # 18
eval_rpn(["7", "3", "-"])            # 4
eval_rpn(["8", "2", "/"])            # 4
eval_rpn(["-11", "5", "+"])          # -6
eval_rpn(["-7", "3", "/"])           # -2
eval_rpn(["10", "6", "9", "3", "+",
  "-11", "*", "/", "*", "17", "+",
  "5", "+"])                         # 22
```
