// Run: node exemplar.js

/**
 * Returns true if all brackets in s are valid and properly nested.
 * O(n) time, O(n) space.
 * @param {string} s
 * @returns {boolean}
 */
function isValidParentheses(s) {
  const matching = { ')': '(', '}': '{', ']': '[' };
  const stack = [];
  for (const c of s) {
    if ('({['.includes(c)) {
      stack.push(c);
    } else {
      if (!stack.length || stack.at(-1) !== matching[c]) return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}

/**
 * Returns days to wait for a warmer temperature at each index.
 * Monotonic stack of indices (decreasing temperatures); pop when a warmer day arrives.
 * O(n) time, O(n) space.
 * @param {number[]} temps
 * @returns {number[]}
 */
function dailyTemperatures(temps) {
  const result = new Array(temps.length).fill(0);
  const stack = []; // indices, decreasing temp order
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack.at(-1)]) {
      const idx = stack.pop();
      result[idx] = i - idx;
    }
    stack.push(i);
  }
  return result;
}

/**
 * Returns the area of the largest rectangle in the histogram.
 * For each bar, the maximum rectangle using it as height extends left and right
 * to the nearest shorter bars. Use a monotonic increasing-height stack.
 * Sentinel 0 appended to flush remaining bars cleanly.
 * O(n) time, O(n) space.
 * @param {number[]} heights
 * @returns {number}
 */
function largestRectangleInHistogram(heights) {
  const h = [...heights, 0]; // sentinel forces remaining bars off the stack
  const stack = []; // indices, increasing height order
  let maxArea = 0;

  for (let i = 0; i < h.length; i++) {
    while (stack.length && h[i] < h[stack.at(-1)]) {
      const height = h[stack.pop()];
      // Width: from after the new stack top to just before i
      const width = stack.length ? i - stack.at(-1) - 1 : i;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }

  return maxArea;
}

module.exports = { isValidParentheses, dailyTemperatures, largestRectangleInHistogram };

function main() {
  console.log(isValidParentheses("()[]{}")); // true
  console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])); // [1,1,4,2,1,1,0,0]
  console.log(largestRectangleInHistogram([2, 1, 5, 6, 2, 3])); // 10
}

main();
