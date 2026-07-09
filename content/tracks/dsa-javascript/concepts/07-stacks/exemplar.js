// Run: node exemplar.js

/**
 * Returns true if the bracket string is valid: matching types, properly
 * nested. Openers defer an obligation; a closer must discharge the most
 * recent one — LIFO, i.e. a stack.
 * O(n) time, O(n) space.
 * @param {string} s  contains only ()[]{}
 * @returns {boolean}
 */
function isValid(s) {
  const openerFor = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
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
  constructor() {
    /** @type {Array<[number, number]>} [value, minSoFar] pairs */
    this.entries = [];
  }

  /** @param {number} val @returns {void} */
  push(val) {
    const min = this.entries.length === 0 ? val : Math.min(val, this.getMin());
    this.entries.push([val, min]);
  }

  /** @returns {void} */
  pop() {
    this.entries.pop();
  }

  /** @returns {number} the top value */
  top() {
    return this.entries[this.entries.length - 1][0];
  }

  /** @returns {number} the smallest value currently in the stack */
  getMin() {
    return this.entries[this.entries.length - 1][1];
  }
}

/**
 * Evaluates a Reverse Polish Notation expression. Operands wait on the
 * stack; an operator pops b (right) then a (left) and pushes a op b.
 * Division truncates toward zero (Math.trunc, never Math.floor).
 * O(n) time, O(n) space.
 * @param {string[]} tokens  integers as strings, or "+", "-", "*", "/"
 * @returns {number}
 */
function evalRPN(tokens) {
  const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => Math.trunc(a / b),
  };
  const stack = [];
  for (const token of tokens) {
    if (token in ops) {
      const b = stack.pop(); // right operand (pushed last)
      const a = stack.pop(); // left operand
      stack.push(ops[token](a, b));
    } else {
      stack.push(Number(token));
    }
  }
  return stack[0];
}

module.exports = { isValid, MinStack, evalRPN };

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
