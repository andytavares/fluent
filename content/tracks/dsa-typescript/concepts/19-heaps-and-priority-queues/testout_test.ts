import assert from "assert";
import { MinHeap, findKthLargest, kSmallestPairs, MedianFinder } from "./stub";

let passed = 0, failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`  FAIL: ${name} — ${e.message}`);
    failed++;
  }
}

// Helper: drain a heap into an array via pop()
function drain<T>(heap: MinHeap<T>): T[] {
  const out: T[] = [];
  while (heap.size() > 0) out.push(heap.pop() as T);
  return out;
}

// Helper: validate a kSmallestPairs result — right pair count, every pair
// drawn from the inputs, and sums in the expected (ascending) order.
function assertPairs(result: number[][], nums1: number[], nums2: number[], expectedSums: number[]) {
  assert.ok(Array.isArray(result), "expected an array of pairs");
  assert.strictEqual(result.length, expectedSums.length,
    `expected ${expectedSums.length} pairs, got ${result.length}`);
  for (const pair of result) {
    assert.ok(Array.isArray(pair) && pair.length === 2, `malformed pair ${JSON.stringify(pair)}`);
    assert.ok(nums1.includes(pair[0]), `${pair[0]} is not in nums1`);
    assert.ok(nums2.includes(pair[1]), `${pair[1]} is not in nums2`);
  }
  assert.deepStrictEqual(result.map(([u, v]) => u + v), expectedSums,
    "pair sums must match, ordered ascending");
}

// ── MinHeap ──
test("MinHeap: pops in ascending order", () => {
  const h = new MinHeap<number>();
  h.push(5); h.push(1); h.push(3);
  assert.deepStrictEqual(drain(h), [1, 3, 5]);
});
test("MinHeap: peek returns the min without removing it", () => {
  const h = new MinHeap<number>();
  h.push(2); h.push(7);
  assert.strictEqual(h.peek(), 2);
  assert.strictEqual(h.size(), 2);
});
test("MinHeap: pop on empty returns undefined", () => {
  const h = new MinHeap<number>();
  assert.strictEqual(h.pop(), undefined);
});
test("MinHeap: peek on empty returns undefined", () => {
  const h = new MinHeap<number>();
  assert.strictEqual(h.peek(), undefined);
});
test("MinHeap: single element push/pop leaves it empty", () => {
  const h = new MinHeap<number>();
  h.push(42);
  assert.strictEqual(h.pop(), 42);
  assert.strictEqual(h.size(), 0);
  assert.strictEqual(h.pop(), undefined);
});
test("MinHeap: duplicates all come out", () => {
  const h = new MinHeap<number>();
  for (const x of [4, 4, 1, 4, 1]) h.push(x);
  assert.deepStrictEqual(drain(h), [1, 1, 4, 4, 4]);
});
test("MinHeap: reverse comparator makes a max-heap", () => {
  const h = new MinHeap<number>((a, b) => b - a);
  for (const x of [5, 1, 3, 9, 7]) h.push(x);
  assert.deepStrictEqual(drain(h), [9, 7, 5, 3, 1]);
});
test("MinHeap: tuple comparator orders by first element", () => {
  const h = new MinHeap<[number, string]>((a, b) => a[0] - b[0]);
  h.push([3, "c"]); h.push([1, "a"]); h.push([2, "b"]);
  assert.deepStrictEqual(drain(h).map((t) => t[1]), ["a", "b", "c"]);
});
test("MinHeap: interleaved push and pop", () => {
  const h = new MinHeap<number>();
  h.push(5); h.push(2);
  assert.strictEqual(h.pop(), 2);
  h.push(1); h.push(8);
  assert.strictEqual(h.pop(), 1);
  assert.strictEqual(h.pop(), 5);
  h.push(0);
  assert.strictEqual(h.pop(), 0);
  assert.strictEqual(h.pop(), 8);
});
test("MinHeap: heapsorts a pseudo-random array", () => {
  const values: number[] = [];
  let seed = 1;
  for (let i = 0; i < 200; i++) {
    seed = (seed * 48271) % 2147483647;
    values.push(seed % 1000 - 500);
  }
  const h = new MinHeap<number>();
  for (const v of values) h.push(v);
  assert.deepStrictEqual(drain(h), [...values].sort((a, b) => a - b));
});
test("MinHeap: large adversarial workload stays consistent", () => {
  const h = new MinHeap<number>();
  // Ascending then descending pushes with periodic pops.
  const popped: number[] = [];
  for (let i = 0; i < 2000; i++) {
    h.push(i);
    h.push(4000 - i);
    if (i % 3 === 0) popped.push(h.pop() as number);
  }
  const rest = drain(h);
  for (let i = 1; i < rest.length; i++) {
    assert.ok(rest[i - 1] <= rest[i], `drain out of order at ${i}`);
  }
  assert.strictEqual(popped.length + rest.length, 4000);
});

// ── findKthLargest ──
test("findKthLargest: classic example", () => {
  assert.strictEqual(findKthLargest([3, 2, 1, 5, 6, 4], 2), 5);
});
test("findKthLargest: duplicates count separately", () => {
  assert.strictEqual(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4);
});
test("findKthLargest: k = 1 is the maximum", () => {
  assert.strictEqual(findKthLargest([2, 9, 4], 1), 9);
});
test("findKthLargest: k = length is the minimum", () => {
  assert.strictEqual(findKthLargest([2, 9, 4], 3), 2);
});
test("findKthLargest: single element", () => {
  assert.strictEqual(findKthLargest([1], 1), 1);
});
test("findKthLargest: all duplicates", () => {
  assert.strictEqual(findKthLargest([7, 7, 7], 2), 7);
});
test("findKthLargest: negative numbers", () => {
  assert.strictEqual(findKthLargest([-1, -5, -3], 2), -3);
});
test("findKthLargest: large input, deep k", () => {
  const nums: number[] = [];
  let seed = 7;
  for (let i = 0; i < 10000; i++) {
    seed = (seed * 48271) % 2147483647;
    nums.push(seed % 100000);
  }
  const sorted = [...nums].sort((a, b) => b - a);
  assert.strictEqual(findKthLargest(nums, 2500), sorted[2499]);
});

// ── kSmallestPairs ──
test("kSmallestPairs: classic example", () => {
  assertPairs(kSmallestPairs([1, 7, 11], [2, 4, 6], 3), [1, 7, 11], [2, 4, 6], [3, 5, 7]);
});
test("kSmallestPairs: duplicate values, equal sums", () => {
  assertPairs(kSmallestPairs([1, 1, 2], [1, 2, 3], 2), [1, 1, 2], [1, 2, 3], [2, 2]);
});
test("kSmallestPairs: k exceeds total pairs — return them all", () => {
  assertPairs(kSmallestPairs([1, 2], [3], 3), [1, 2], [3], [4, 5]);
});
test("kSmallestPairs: k = 1", () => {
  assert.deepStrictEqual(kSmallestPairs([1, 7], [2, 4], 1), [[1, 2]]);
});
test("kSmallestPairs: empty nums1", () => {
  assert.deepStrictEqual(kSmallestPairs([], [1, 2], 5), []);
});
test("kSmallestPairs: empty nums2", () => {
  assert.deepStrictEqual(kSmallestPairs([1, 2], [], 5), []);
});
test("kSmallestPairs: negative numbers", () => {
  assertPairs(kSmallestPairs([-10, -4, 0], [-5, 3], 3), [-10, -4, 0], [-5, 3], [-15, -9, -7]);
});
test("kSmallestPairs: exact k equals total pairs", () => {
  assertPairs(kSmallestPairs([1, 2], [1, 2], 4), [1, 2], [1, 2], [2, 3, 3, 4]);
});
test("kSmallestPairs: large arrays, small k — must not materialize the grid", () => {
  const nums1 = Array.from({ length: 5000 }, (_, i) => i * 3);      // 0,3,6,...
  const nums2 = Array.from({ length: 5000 }, (_, i) => i * 3 + 1);  // 1,4,7,...
  assertPairs(kSmallestPairs(nums1, nums2, 10), nums1, nums2,
    [1, 4, 4, 7, 7, 7, 10, 10, 10, 10]);
});

// ── MedianFinder ──
test("MedianFinder: classic sequence", () => {
  const mf = new MedianFinder();
  mf.addNum(1);
  mf.addNum(2);
  assert.strictEqual(mf.findMedian(), 1.5);
  mf.addNum(3);
  assert.strictEqual(mf.findMedian(), 2);
});
test("MedianFinder: single element", () => {
  const mf = new MedianFinder();
  mf.addNum(7);
  assert.strictEqual(mf.findMedian(), 7);
});
test("MedianFinder: descending insertion order", () => {
  const mf = new MedianFinder();
  for (const x of [5, 4, 3, 2, 1]) mf.addNum(x);
  assert.strictEqual(mf.findMedian(), 3);
});
test("MedianFinder: duplicates", () => {
  const mf = new MedianFinder();
  for (const x of [2, 2, 2]) mf.addNum(x);
  assert.strictEqual(mf.findMedian(), 2);
});
test("MedianFinder: negative numbers", () => {
  const mf = new MedianFinder();
  for (const x of [-1, -2, -3, -4]) mf.addNum(x);
  assert.strictEqual(mf.findMedian(), -2.5);
});
test("MedianFinder: median tracks every step", () => {
  const mf = new MedianFinder();
  const stream = [6, 10, 2, 6, 5];
  const expected = [6, 8, 6, 6, 6];
  for (let i = 0; i < stream.length; i++) {
    mf.addNum(stream[i]);
    assert.strictEqual(mf.findMedian(), expected[i], `after adding ${stream[i]}`);
  }
});
test("MedianFinder: long pseudo-random stream matches a sorted oracle", () => {
  const mf = new MedianFinder();
  const seen: number[] = [];
  let seed = 3;
  for (let i = 0; i < 1000; i++) {
    seed = (seed * 48271) % 2147483647;
    const x = seed % 500 - 250;
    mf.addNum(x);
    seen.push(x);
    if (i % 97 === 0) {
      const sorted = [...seen].sort((a, b) => a - b);
      const n = sorted.length;
      const expected = n % 2 === 1
        ? sorted[(n - 1) / 2]
        : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      assert.strictEqual(mf.findMedian(), expected, `after ${n} elements`);
    }
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
