# Stack

## What you'll learn

The stack patterns behind three interview staples: matching openers to closers (Valid Parentheses), carrying an aggregate alongside every entry so queries stay O(1) (Min Stack), and postfix evaluation (Reverse Polish Notation). The common thread: a stack remembers *pending* work and hands it back in exactly the reverse order you deferred it.

## Key concepts

### `ArrayDeque` is Java's stack

Java has a legacy `Stack` class, but it extends `Vector` and is synchronized — slower and not idiomatic. Use `ArrayDeque<T>` as a stack: `push`/`pop`/`peek` operate on the same end and are O(1) amortized.

```java
Deque<Character> stack = new ArrayDeque<>();
stack.push(x);        // push
char top = stack.peek(); // peek — does not remove
stack.pop();           // pop — removes and returns
stack.isEmpty();       // emptiness check
```

### Matching structure — push openers, pop on closers

Anything with properly-nested delimiters reduces to one rule: an opener defers an obligation, a closer must discharge the **most recent** undischarged one — which is exactly LIFO order.

```java
Map<Character, Character> openerFor = Map.of(')', '(', ']', '[', '}', '{');
Deque<Character> stack = new ArrayDeque<>();
for (char c : s.toCharArray()) {
    if (c == '(' || c == '[' || c == '{') {
        stack.push(c);
    } else if (stack.isEmpty() || stack.pop() != openerFor.get(c)) {
        return false; // wrong or missing opener
    }
}
return stack.isEmpty(); // no unclosed openers left
```

Unlike JavaScript's `pop()` on an empty array (which quietly returns `undefined`), Java's `ArrayDeque.pop()` throws `NoSuchElementException` on an empty deque — you must check `isEmpty()` explicitly before popping, or the empty-stack case crashes instead of failing the match.

### Aggregates alongside entries — O(1) snapshots

To answer "what's the minimum right now?" in O(1), store the answer *with each entry* at push time. Each stack slot holds a `[value, minSoFar]` pair; popping automatically restores the previous minimum because it lives one slot down:

```java
push(val):  min = empty ? val : Math.min(val, getMin()); stack.push(new int[]{val, min});
getMin():   return stack.peek()[1];
```

The insight generalizes: any running aggregate (min, max, sum) can be snapshotted per-entry, buying O(1) queries for O(n) extra space.

### Postfix evaluation — operands wait on the stack

Reverse Polish Notation needs no parentheses and no precedence: operands go on the stack; an operator pops its two operands, applies, and pushes the result. Pop order matters — the **second** pop is the left operand:

```java
int b = stack.pop(); // right operand (pushed last)
int a = stack.pop(); // left operand
stack.push(apply(op, a, b)); // a op b, not b op a
```

Getting `a`/`b` backwards is invisible for `+`/`*` and wrong for `-`/`/` — test with subtraction first.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Valid Parentheses | O(n) | O(n) | push openers, pop on closers |
| Min Stack | O(1) per op | O(n) | aggregate stored per entry |
| Evaluate RPN | O(n) | O(n) | operand stack |

## Watch out

- **`ArrayDeque.pop()` on an empty deque throws** — always check `isEmpty()` first, unlike JavaScript/Python where popping empty returns a sentinel value.
- **Pop order in RPN**: first pop is the *right* operand. `{"7","3","-"}` is `7 - 3 = 4`; swapped operands give `-4` and still pass every `+`/`*` test.
- **Integer division in Java already truncates toward zero** — `-7 / 3 == -2` in Java (unlike Python's `//`, which floors toward negative infinity). This means `a / b` on `int`s is exactly RPN's required truncation; no extra call is needed like in some other languages, but `/ 0` still throws `ArithmeticException`.
- **Both leftover failure modes** in Valid Parentheses: `"("` fails because the stack isn't empty at the end, `")"` fails because a closer found nothing to pop. Many solutions check one and forget the other.
- **Min Stack: `pop` must restore the previous minimum.** A single `min` field breaks the moment the minimum is popped; that's why the min is stored per entry (or in a parallel stack).
- **Duplicate minimums**: push 2, push 2, pop — `getMin()` must still be 2. Per-entry snapshots handle this for free; a parallel stack must push on ties (`val <= currentMin`), not just strict improvements.
- **RPN tokens are strings**: `"-11"` is a negative operand, not a minus operator — match the token against `"+"`, `"-"`, `"*"`, `"/"` exactly, then parse operands with `Integer.parseInt(token)`.

## Problem walkthroughs

### Valid Parentheses ★

**Problem.** Given a string containing only the characters `()[]{}`, return `true` if every opener is closed by the matching closer in the correct (properly nested) order.

**Example.**

    "()[]{}" → true
    "(]"     → false
    "([)]"   → false
    "{[]}"   → true

**Steps.**
1. Build a closer → opener map.
2. Walk the string. Push every opener.
3. On a closer, first check the stack isn't empty, then pop and compare to the required opener; mismatch — or an empty stack — means `false`.
4. After the walk, return `stack.isEmpty()` — leftover openers like `"(("` are the second failure mode.
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
2. Keep a `Deque<String>` of real directory names. On `".."`, pop if non-empty (popping past root is a no-op). Push everything else.
3. Return `"/" + String.join("/", stack)` (reading the deque front-to-back). An empty stack yields `"/"`.
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
1. Store entries as `[value, minSoFar]` int-pairs in one `Deque<int[]>`.
2. `push(val)`: the new minimum is `val` if the stack is empty, else `Math.min(val, getMin())`; push the pair.
3. `pop()`: pop the pair — the previous entry's snapshot *is* the restored minimum, no recomputation.
4. `top()` / `getMin()`: read the top pair's value / min via `stack.peek()`.
5. Why a lone `min` field fails: after popping the minimum you'd need to rescan for the next-smallest — O(n). The per-entry snapshot pre-pays that answer at push time.

**Complexity.** O(1) time per operation / O(n) space (one extra number per entry).

### Evaluate Reverse Polish Notation ★

**Problem.** Evaluate an arithmetic expression given as an array of tokens in postfix (RPN) order. Tokens are integers (as strings, possibly negative) or one of `+ - * /`. Division truncates toward zero. The expression is valid; every intermediate value fits in 32 bits.

**Example.**

    ["2","1","+","3","*"]  → 9    ((2 + 1) * 3)
    ["4","13","5","/","+"] → 6    (4 + 13/5)

**Steps.**
1. Walk the tokens with a `Deque<Integer>`.
2. Operand token → `stack.push(Integer.parseInt(token))`.
3. Operator token → pop `b` (right), pop `a` (left), push `a op b`; for `/`, plain `a / b` already truncates toward zero in Java.
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

### `isValid(String s)`

`s` contains only the six characters `(`, `)`, `[`, `]`, `{`, `}`. Return `true` if the string is valid: every opener is closed by the same bracket type, in properly nested (LIFO) order. An empty string is valid. O(n) time.

```java
Solution.isValid("()");     // true
Solution.isValid("()[]{}"); // true
Solution.isValid("(]");     // false
Solution.isValid("([)]");   // false
Solution.isValid("{[]}");   // true
Solution.isValid("(");      // false (unclosed opener)
Solution.isValid(")");      // false (closer with no opener)
Solution.isValid("");       // true
```

Edge cases: empty string (`true`), lone opener (`false`), lone closer (`false`), correct types interleaved wrongly (`"([)]"` → `false`), deep nesting.

### `MinStack` (class)

A stack of numbers with O(1) minimum lookup. Implement it as a class instantiated with `new MinStack()` (starts empty) and exposing exactly these methods, **each running in O(1)**:

- `void push(int val)` — push `val` onto the stack.
- `void pop()` — remove the top element. Called only when non-empty.
- `int top()` — return the top element without removing it. Called only when non-empty.
- `int getMin()` — return the smallest value currently in the stack. Called only when non-empty.

```java
MinStack st = new MinStack();
st.push(-2);
st.push(0);
st.push(-3);
st.getMin(); // -3
st.pop();
st.top();    // 0
st.getMin(); // -2
```

Edge cases: the minimum getting popped (the *previous* minimum must come back), duplicate minimums (pushing 2 twice then popping once keeps `getMin()` at 2), negative values, interleaved push/pop sequences. A `getMin` that scans the stack is O(n) and fails the task.

### `evalRPN(String[] tokens)`

`tokens` is a valid arithmetic expression in Reverse Polish (postfix) notation: each token is either an integer in string form (possibly negative, like `"-11"`) or one of the operators `"+"`, `"-"`, `"*"`, `"/"`. An operator applies to the two values most recently produced, left operand first — so `{"7", "3", "-"}` is `7 - 3`. Division **truncates toward zero** (`6 / -4` → `-1`, not `-2`). Return the final number. Operands and every intermediate result fit in 32-bit range. O(n) time.

```java
Solution.evalRPN(new String[]{"2", "1", "+", "3", "*"});   // 9   ((2 + 1) * 3)
Solution.evalRPN(new String[]{"4", "13", "5", "/", "+"});  // 6   (4 + 13/5, truncated)
Solution.evalRPN(new String[]{"18"});                      // 18
Solution.evalRPN(new String[]{"10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"}); // 22
```

Edge cases: single-token expression, negative operand tokens (`"-11"` is a number, not an operator), operand order for `-` and `/` (`{"7","3","-"}` → `4`), truncation toward zero for negative quotients (`{"-7","3","/"}` → `-2`).
