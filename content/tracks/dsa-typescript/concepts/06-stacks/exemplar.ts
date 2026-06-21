// Run: tsx exemplar.ts

export function isValidParentheses(s: string): boolean {
  const stack: string[] = [];
  const matching: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack[stack.length - 1] !== matching[ch]) {
        return false;
      }
      stack.pop();
    }
  }
  return stack.length === 0;
}

export function dailyTemperatures(temps: number[]): number[] {
  const result = new Array<number>(temps.length).fill(0);
  const stack: number[] = []; // monotonic decreasing stack of indices

  for (let i = 0; i < temps.length; i++) {
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      result[idx] = i - idx;
    }
    stack.push(i);
  }
  return result;
}

export function largestRectangleInHistogram(heights: number[]): number {
  const stack: number[] = []; // monotonic increasing stack of indices
  let maxArea = 0;

  // Sentinel 0 at the end forces remaining bars to be processed
  const h = [...heights, 0];

  for (let i = 0; i < h.length; i++) {
    while (stack.length > 0 && h[i] < h[stack[stack.length - 1]]) {
      const height = h[stack.pop()!];
      // Width extends from just after the new stack top to just before i
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }
  return maxArea;
}
