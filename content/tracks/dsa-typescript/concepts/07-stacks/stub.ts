// Run: tsx stub.ts

/**
 * Returns true if the bracket string is valid: matching types, properly
 * nested. s contains only ()[]{}.
 */
function isValid(s: string): boolean {
  // TODO: push openers; on a closer, pop and compare against a
  // closer → opener map; finish by checking the stack is empty
  return false;
}

/**
 * A stack of numbers with O(1) getMin.
 * All four methods must be O(1); pop/top/getMin are only called when
 * the stack is non-empty.
 */
class MinStack {
  constructor() {
    // TODO: one array of [value, minSoFar] pairs (or two parallel stacks)
  }

  push(val: number): void {
    // TODO: snapshot the min alongside the value —
    // min = empty ? val : Math.min(val, this.getMin())
  }

  pop(): void {
    // TODO: remove the top entry; the previous entry's snapshot
    // restores the minimum automatically
  }

  /** @returns the top value */
  top(): number {
    // TODO
    return 0;
  }

  /** @returns the smallest value currently in the stack */
  getMin(): number {
    // TODO: read it off the top entry — no scanning
    return 0;
  }
}

/**
 * Evaluates a Reverse Polish Notation expression.
 * Division truncates toward zero.
 * @param tokens integers as strings, or "+", "-", "*", "/"
 */
function evalRPN(tokens: string[]): number {
  // TODO: number stack; on an operator pop b (right) then a (left),
  // push a op b — use Math.trunc for division
  return 0;
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
