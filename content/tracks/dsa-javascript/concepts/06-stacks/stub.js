// Run: node stub.js

/**
 * Returns true if all brackets in s are valid and properly nested.
 * @param {string} s
 * @returns {boolean}
 */
function isValidParentheses(s) {
  // TODO: push open brackets; on close bracket check top matches; return stack empty at end
  return false;
}

/**
 * Returns days to wait for a warmer temperature at each index.
 * @param {number[]} temps
 * @returns {number[]}
 */
function dailyTemperatures(temps) {
  // TODO: monotonic stack of indices (decreasing temps); pop when temps[i] > temps[top]
  return [];
}

/**
 * Returns the area of the largest rectangle in the histogram.
 * @param {number[]} heights
 * @returns {number}
 */
function largestRectangleInHistogram(heights) {
  // TODO: append sentinel 0; monotonic increasing-height stack of indices
  // when h[i] < h[top], pop and compute area: height * (stack empty ? i : i - top - 1)
  return 0;
}

module.exports = { isValidParentheses, dailyTemperatures, largestRectangleInHistogram };

function main() {
  console.log(isValidParentheses("()[]{}")); // true
  console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])); // [1,1,4,2,1,1,0,0]
  console.log(largestRectangleInHistogram([2, 1, 5, 6, 2, 3])); // 10
}

main();
