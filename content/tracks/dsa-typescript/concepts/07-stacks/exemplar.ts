// Run: tsx exemplar.ts

/**
 * Returns true if the bracket string is valid: matching types, properly
 * nested. Openers defer an obligation; a closer must discharge the most
 * recent one — LIFO, i.e. a stack.
 * O(n) time, O(n) space.
 * @param s contains only ()[]{}
 */
function isValid(s: string): boolean {
  const openerFor: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const c of s) {
    if (c === "(" || c === "[" || c === "{") {
      stack.push(c);
    } else if (stack.pop() !== openerFor[c]) {
      return false; // wrong opener, or empty stack (pop() → undefined)
    }
  }
  return stack.length === 0; // leftover openers are the second failure mode
}

/**
 * A stack of numbers with O(1) getMin. Each entry stores [value, minSoFar]:
 * the min is snapshotted at push time, so popping restores the previous
 * minimum with no recomputation.
 * All operations O(1), O(n) space.
 */
class MinStack {
  private entries: [number, number][] = [];

  push(val: number): void {
    const min = this.entries.length === 0 ? val : Math.min(val, this.getMin());
    this.entries.push([val, min]);
  }

  pop(): void {
    this.entries.pop();
  }

  /** @returns the top value */
  top(): number {
    return this.entries[this.entries.length - 1][0];
  }

  /** @returns the smallest value currently in the stack */
  getMin(): number {
    return this.entries[this.entries.length - 1][1];
  }
}

/**
 * Evaluates a Reverse Polish Notation expression. Operands wait on the
 * stack; an operator pops b (right) then a (left) and pushes a op b.
 * Division truncates toward zero (Math.trunc, never Math.floor).
 * O(n) time, O(n) space.
 * @param tokens integers as strings, or "+", "-", "*", "/"
 */
function evalRPN(tokens: string[]): number {
  const ops: Record<string, (a: number, b: number) => number> = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => Math.trunc(a / b),
  };
  const stack: number[] = [];
  for (const token of tokens) {
    if (token in ops) {
      const b = stack.pop()!; // right operand (pushed last)
      const a = stack.pop()!; // left operand
      stack.push(ops[token](a, b));
    } else {
      stack.push(Number(token));
    }
  }
  return stack[0];
}

export { isValid, MinStack, evalRPN };

function main() {
  console.log(isValid("()[]{}")); // true
  console.log(isValid("([)]")); // false

  const st = new MinStack();
  st.push(-2);
  st.push(0);
  st.push(-3);
  console.log(st.getMin()); // -3
  st.pop();
  console.log(st.top(), st.getMin()); // 0 -2

  console.log(evalRPN(["2", "1", "+", "3", "*"])); // 9
}

main();
