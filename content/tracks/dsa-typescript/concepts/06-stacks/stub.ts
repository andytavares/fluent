// Run: tsx stub.ts

// Return true if every opening bracket has a correct matching closing bracket.
export function isValidParentheses(s: string): boolean {
  // TODO: push open brackets; on close bracket, verify stack top matches
  return false;
}

// Return array where result[i] = days until a warmer temperature, or 0.
export function dailyTemperatures(temps: number[]): number[] {
  // TODO: monotonic decreasing stack of indices; pop when current temp is warmer
  return [];
}

// Return the area of the largest rectangle in the histogram.
// Each bar has width 1.
export function largestRectangleInHistogram(heights: number[]): number {
  // TODO: monotonic increasing stack of indices; pop when current height is smaller;
  // use a sentinel 0 at the end to flush remaining entries
  return 0;
}

// Usage examples (uncomment to test manually):
// console.log(isValidParentheses("()[]{}")); // true
// console.log(dailyTemperatures([73,74,75,71,69,72,76,73])); // [1,1,4,2,1,1,0,0]
// console.log(largestRectangleInHistogram([2,1,5,6,2,3]));   // 10
