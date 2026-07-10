import { describe, it, expect } from "vitest";
import { estimateComplexity } from "../../src/index.js";

describe("estimateComplexity", () => {
  it("returns O(1)/O(1) for empty code", () => {
    const result = estimateComplexity("", "python");
    expect(result.time).toBe("O(1)");
    expect(result.space).toBe("O(1)");
  });

  it("returns O(1)/O(1) for code with no loops or recursion", () => {
    const code = `function add(a, b) {\n  return a + b;\n}`;
    const result = estimateComplexity(code, "javascript");
    expect(result.time).toBe("O(1)");
    expect(result.space).toBe("O(1)");
  });

  it("returns O(n)/O(1) for a single loop", () => {
    const code = `
function sum(nums) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    total += nums[i];
  }
  return total;
}`;
    const result = estimateComplexity(code, "javascript");
    expect(result.time).toBe("O(n)");
    expect(result.space).toBe("O(1)");
  });

  it("returns O(n^2)/O(1) for a nested double loop", () => {
    const code = `
func bubbleSort(arr []int) {
  for i := 0; i < len(arr); i++ {
    for j := 0; j < len(arr)-i-1; j++ {
      if arr[j] > arr[j+1] {
        arr[j], arr[j+1] = arr[j+1], arr[j]
      }
    }
  }
}`;
    const result = estimateComplexity(code, "go");
    expect(result.time).toBe("O(n^2)");
    expect(result.space).toBe("O(1)");
  });

  it("returns O(n)/O(n) for a single loop building a list", () => {
    const code = `
def doubled(nums):
    result = []
    for n in nums:
        result.append(n * 2)
    return result
`;
    const result = estimateComplexity(code, "python");
    expect(result.time).toBe("O(n)");
    expect(result.space).toBe("O(n)");
  });

  it("returns O(2^n)/O(n) for naive recursive fibonacci", () => {
    const code = `
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
`;
    const result = estimateComplexity(code, "python");
    expect(result.time).toBe("O(2^n)");
    expect(result.space).toBe("O(n)");
  });

  it("returns O(n)/O(n) for memoized recursive fibonacci", () => {
    const code = `
def fib(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
`;
    const result = estimateComplexity(code, "python");
    expect(result.time).toBe("O(n)");
    expect(result.space).toBe("O(n)");
  });

  it("returns O(log n) time for recursive binary search (one self-call + halving)", () => {
    const code = `
function binarySearch(arr, target, lo, hi) {
  if (lo > hi) return -1;
  const mid = Math.floor((lo + hi) / 2);
  if (arr[mid] === target) return mid;
  const nextLo = arr[mid] < target ? mid + 1 : lo;
  const nextHi = arr[mid] < target ? hi : mid - 1;
  return binarySearch(arr, target, nextLo, nextHi);
}`;
    const result = estimateComplexity(code, "javascript");
    expect(result.time).toBe("O(log n)");
    // Space: we treat single-self-call halving recursion as O(log n)
    // (call stack depth halves each time), documented choice per spec.
    expect(result.space).toBe("O(log n)");
  });

  it("detects nested loops in Python via indentation (no braces)", () => {
    const code = `
def pairs(items):
    result = []
    for i in items:
        for j in items:
            result.append((i, j))
    return result
`;
    const result = estimateComplexity(code, "python");
    expect(result.time).toBe("O(n^2)");
    expect(result.space).toBe("O(n)");
  });

  it("strips comments and string contents so keywords inside them don't count", () => {
    const code = `
// for the record, this function loops while doing nothing special
function noop() {
  const msg = "for i in range(10): while True: loop forever";
  return msg;
}`;
    const result = estimateComplexity(code, "javascript");
    expect(result.time).toBe("O(1)");
    expect(result.space).toBe("O(1)");
  });

  it("handles a Go-syntax example (single loop)", () => {
    const code = `
func sum(nums []int) int {
  total := 0
  for _, n := range nums {
    total += n
  }
  return total
}`;
    const result = estimateComplexity(code, "go");
    expect(result.time).toBe("O(n)");
  });

  it("caps loop nesting exponent at 4 for very deep nesting", () => {
    const code = `
for a in range(n):
    for b in range(n):
        for c in range(n):
            for d in range(n):
                for e in range(n):
                    print(a, b, c, d, e)
`;
    const result = estimateComplexity(code, "python");
    expect(result.time).toBe("O(n^4)");
  });
});
