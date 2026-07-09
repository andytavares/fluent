# Stack

## What you'll learn

The stack patterns behind five interview staples: matching openers to closers (Valid Parentheses), reducing a path segment-by-segment (Simplify Path), carrying an aggregate alongside every entry so queries stay O(1) (Min Stack), postfix evaluation (Reverse Polish Notation), and saving/restoring context around nested structure (Basic Calculator). The common thread: a stack remembers *pending* work and hands it back in exactly the reverse order you deferred it.

## Key concepts

### JavaScript arrays are stacks

`push` and `pop` on an array are amortized O(1) and operate on the same end. Peek with `stack[stack.length - 1]`; test emptiness with `stack.length === 0`. Never use `shift`/`unshift` for stack work — they're O(n).

```js
const stack = [];
stack.push(x);                     // push
const top = stack[stack.length - 1]; // peek
stack.pop();                       // pop (returns the removed value)
```

### Matching structure — push openers, pop on closers

Anything with properly-nested delimiters reduces to one rule: an opener defers an obligation, a closer must discharge the **most recent** undischarged one — which is exactly LIFO order.

```js
const openerFor = { ")": "(", "]": "[", "}": "{" };
for (const c of s) {
  if (c === "(" || c === "[" || c === "{") stack.push(c);
  else if (stack.pop() !== openerFor[c]) return false; // wrong or missing opener
}
return stack.length === 0; // no unclosed openers left
```

Note the two distinct failure modes the last two lines catch: a closer with no/wrong opener (`pop()` returns `undefined` or the wrong bracket), and leftover openers at the end.

### Aggregates alongside entries — O(1) snapshots

To answer "what's the minimum right now?" in O(1), store the answer *with each entry* at push time. Each stack slot holds `[value, minSoFar]`; popping automatically restores the previous minimum because it lives one slot down:

```js
push(val):  min = empty ? val : Math.min(val, currentMin); stack.push([val, min]);
getMin():   return stack[stack.length - 1][1];
```

The insight generalizes: any running aggregate (min, max, sum) can be snapshotted per-entry, buying O(1) queries for O(n) extra space.

### Postfix evaluation — operands wait on the stack

Reverse Polish Notation needs no parentheses and no precedence: operands go on the stack; an operator pops its two operands, applies, and pushes the result. Pop order matters — the **second** pop is the left operand:

```js
const b = stack.pop(); // right operand (pushed last)
const a = stack.pop(); // left operand
stack.push(apply(op, a, b)); // a op b, not b op a
```

Getting `a`/`b` backwards is invisible for `+`/`*` and wrong for `-`/`/` — test with subtraction first.

### Save and restore context around nesting

For nested expressions like `1 - (2 + 3)`, a stack holds the *suspended* outer computation while you evaluate the inside. On `(`, push the running result and pending sign, reset the accumulators; on `)`, pop them back and fold the inner result in. Same pattern as a call stack — because it is one.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Valid Parentheses | O(n) | O(n) | push openers, pop on closers |
| Min Stack | O(1) per op | O(n) | aggregate stored per entry |
| Evaluate RPN | O(n) | O(n) | operand stack |

## Watch out

- **Pop order in RPN**: first pop is the *right* operand. `["7","3","-"]` is `7 - 3 = 4`; swapped operands give `-4` and still pass every `+`/`*` test.
- **Division truncates toward zero**, not toward −∞: use `Math.trunc(a / b)`, never `Math.floor`. `Math.trunc(-7 / 3)` is `-2`; `Math.floor` gives `-3`.
- **Both leftover failure modes** in Valid Parentheses: `"("` fails because the stack isn't empty at the end, `")"` fails because a closer found nothing to pop. Many solutions check one and forget the other.
- **`pop()` on an empty array returns `undefined`**, it doesn't throw — comparing `undefined !== opener` conveniently fails the match, but *rely* on that consciously, don't stumble into it.
- **Min Stack: `pop` must restore the previous minimum.** A single `min` variable breaks the moment the minimum is popped; that's why the min is stored per entry (or in a parallel stack).
- **Duplicate minimums**: push 2, push 2, pop — `getMin()` must still be 2. Per-entry snapshots handle this for free; a parallel stack must push on ties (`val <= currentMin`), not just strict improvements.
- **RPN tokens are strings**: `"-11"` is a negative operand, not a minus operator — match `token === "-"` exactly, then convert operands with `Number(token)`.

## Problem walkthroughs

### Valid Parentheses ★

**Problem.** Given a string containing only the characters `()[]{}`,  return `true` if every opener is closed by the matching closer in the correct (properly nested) order.

**Example.**

    "()[]{}" → true
    "(]"     → false
    "([)]"   → false
    "{[]}"   → true

**Steps.**
1. Build a closer → opener map: `{ ")": "(", "]": "[", "}": "{" }`.
2. Walk the string. Push every opener.
3. On a closer, pop and compare to the required opener; mismatch — or an empty stack, where `pop()` yields `undefined` — means `false`.
4. After the walk, return `stack.length === 0` — leftover openers like `"(("` are the second failure mode.
5. LIFO is the whole proof: proper nesting means the most recently opened bracket must close first.

**Complexity.** O(n) time / O(n) space worst case (all openers).

### Simplify Path

**Problem.** Given an absolute Unix path (starts with `/`), return its canonical form: no `.` segments, no `..` segments (they pop one directory), no repeated or trailing slashes. The result starts with `/` and root's `..` stays at root.

**Example.**

    "/home//foo/"    → "/home/foo"
    "/a/./b/../../c" → "/c"
    "/../"           → "/"

**Steps.**
1. `path.split("/")` — empty strings (from `//` and the leading/trailing slashes) and `"."` segments are no-ops; skip them.
2. Keep a stack of real directory names. On `".."`, pop (popping an empty stack is a no-op — you can't go above root). Push everything else.
3. Return `"/" + stack.join("/")`. An empty stack yields `"/"`.
4. The stack *is* the working directory: each `..` undoes the most recent `cd`, which is LIFO by definition.

**Complexity.** O(n) time / O(n) space.

### Min Stack ★

**Problem.** Design a stack supporting `push(val)`, `pop()`, `top()`, and `getMin()` (the minimum value currently in the stack) — **all in O(1) time**.

**Example.**

    push(-2), push(0), push(-3)
    getMin() → -3
    pop()
    top()    → 0
    getMin() → -2

**Steps.**
1. Store entries as `[value, minSoFar]` pairs in one array.
2. `push(val)`: the new minimum is `val` if the stack is empty, else `Math.min(val, getMin())`; push the pair.
3. `pop()`: pop the pair — the previous entry's snapshot *is* the restored minimum, no recomputation.
4. `top()` / `getMin()`: read the top pair's value / min.
5. Why a lone `min` variable fails: after popping the minimum you'd need to rescan for the next-smallest — O(n). The per-entry snapshot pre-pays that answer at push time.

**Complexity.** O(1) time per operation / O(n) space (one extra number per entry).

### Evaluate Reverse Polish Notation ★

**Problem.** Evaluate an arithmetic expression given as an array of tokens in postfix (RPN) order. Tokens are integers (as strings, possibly negative) or one of `+ - * /`. Division truncates toward zero. The expression is valid; every intermediate value fits in 32 bits.

**Example.**

    ["2","1","+","3","*"]  → 9    ((2 + 1) * 3)
    ["4","13","5","/","+"] → 6    (4 + 13/5)

**Steps.**
1. Walk the tokens with a number stack.
2. Operand token → `stack.push(Number(token))`.
3. Operator token → pop `b` (right), pop `a` (left), push `a op b`; for `/`, push `Math.trunc(a / b)`.
4. The single value left on the stack is the answer.
5. Postfix works stack-natively because an operator always arrives *after* both its operands — they're sitting on top, in order.

**Complexity.** O(n) time / O(n) space.

### Basic Calculator

**Problem.** Evaluate a string expression containing digits, `+`, `-`, parentheses, and spaces. Unary minus appears only where an operand is expected (e.g. `"-(3+4)"`). Return the integer value.

**Example.**

    "1 + 1"                  → 2
    " 2-1 + 2 "              → 3
    "(1+(4+5+2)-3)+(6+8)"    → 23

**Steps.**
1. Scan left to right with three registers: `result` (evaluated so far at this depth), `sign` (+1/−1 pending for the next operand), and a stack.
2. Digits: accumulate the full multi-digit number, then `result += sign * number`.
3. `+` / `-`: set `sign` to +1 / −1. Spaces: skip.
4. `(`: push `result` and `sign` onto the stack, then reset `result = 0`, `sign = 1` — you're starting a fresh sub-expression.
5. `)`: finish the sub-expression, then restore: `result = poppedResult + poppedSign * result`.
6. The stack holds suspended outer contexts exactly like call frames — depth of nesting = stack height.

**Complexity.** O(n) time / O(d) space for nesting depth d.

## Interview follow-ups

- After **Valid Parentheses**: "Longest valid parentheses substring?" (stack of indexes, or two-direction counting.) "Minimum insertions to balance?" (track unmatched openers and needed closers — O(1) space.)
- After **Min Stack**: "Constant *extra* space per element bothers me — do better?" (store deltas against the running min: one stack, but subtle overflow discussion.) "Max Stack with popMax?" (two stacks + lazy deletion, or a doubly linked list + ordered map.)
- After **Evaluate RPN**: "Convert infix to RPN?" (shunting-yard — an operator stack ordered by precedence.) "Why does RPN need no parentheses?" (operator position encodes the tree shape.)
- After **Basic Calculator**: "Add `*` and `/` (Basic Calculator II)?" (keep a `last` term; multiply/divide fold into it before it joins the sum.)

## The task

Two functions and one class. Complexity requirements are part of the task.

### `isValid(s)`

`s` contains only the six characters `(`, `)`, `[`, `]`, `{`, `}`. Return `true` if the string is valid: every opener is closed by the same bracket type, in properly nested (LIFO) order. An empty string is valid. O(n) time.

```js
isValid("()");     // true
isValid("()[]{}"); // true
isValid("(]");     // false
isValid("([)]");   // false
isValid("{[]}");   // true
isValid("(");      // false (unclosed opener)
isValid(")");      // false (closer with no opener)
isValid("");       // true
```

Edge cases: empty string (`true`), lone opener (`false`), lone closer (`false`), correct types interleaved wrongly (`"([)]"` → `false`), deep nesting.

### `MinStack` (class)

A stack of numbers with O(1) minimum lookup. Implement it as a class instantiated with `new MinStack()` (starts empty) and exposing exactly these methods, **each running in O(1)**:

- `push(val)` — push `val` onto the stack. Return value ignored.
- `pop()` — remove the top element. Return value ignored. Called only when non-empty.
- `top()` — return the top element without removing it. Called only when non-empty.
- `getMin()` — return the smallest value currently in the stack. Called only when non-empty.

```js
const st = new MinStack();
st.push(-2);
st.push(0);
st.push(-3);
st.getMin(); // -3
st.pop();
st.top();    // 0
st.getMin(); // -2
```

Edge cases: the minimum getting popped (the *previous* minimum must come back), duplicate minimums (pushing 2 twice then popping once keeps `getMin()` at 2), negative values, interleaved push/pop sequences. A `getMin` that scans the stack is O(n) and fails the task.

### `evalRPN(tokens)`

`tokens` is a valid arithmetic expression in Reverse Polish (postfix) notation: each token is either an integer in string form (possibly negative, like `"-11"`) or one of the operators `"+"`, `"-"`, `"*"`, `"/"`. An operator applies to the two values most recently produced, left operand first — so `["7", "3", "-"]` is `7 - 3`. Division **truncates toward zero** (`6 / -4` → `-1`, not `-2`). Return the final number. Operands and every intermediate result fit in 32-bit range. O(n) time.

```js
evalRPN(["2", "1", "+", "3", "*"]);   // 9   ((2 + 1) * 3)
evalRPN(["4", "13", "5", "/", "+"]);  // 6   (4 + 13/5, truncated)
evalRPN(["18"]);                      // 18
evalRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]); // 22
```

Edge cases: single-token expression, negative operand tokens (`"-11"` is a number, not an operator), operand order for `-` and `/` (`["7","3","-"]` → `4`), truncation toward zero for negative quotients (`["-7","3","/"]` → `-2`).
