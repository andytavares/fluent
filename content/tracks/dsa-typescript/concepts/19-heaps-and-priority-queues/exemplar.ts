// Run: npx tsx exemplar.ts

/**
 * An array-backed binary min-heap.
 * compare(a, b) < 0 means a sits above b; default is a numeric min-heap.
 * push/pop are O(log n) — one repair walk of the complete tree.
 */
class MinHeap<T> {
  private items: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number = (a, b) => (a as unknown as number) - (b as unknown as number)) {
    this.compare = compare;
  }

  size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  push(value: T): void {
    this.items.push(value); // append keeps the tree complete
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(this.items[i], this.items[parent]) >= 0) break;
      [this.items[i], this.items[parent]] = [this.items[parent], this.items[i]];
      i = parent;
    }
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop() as T;
    if (this.items.length > 0) {
      // Move the last leaf to the root, then sift down toward the smaller child.
      this.items[0] = last;
      let i = 0;
      const n = this.items.length;
      for (;;) {
        let smallest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        if (l < n && this.compare(this.items[l], this.items[smallest]) < 0) smallest = l;
        if (r < n && this.compare(this.items[r], this.items[smallest]) < 0) smallest = r;
        if (smallest === i) break;
        [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
        i = smallest;
      }
    }
    return top;
  }
}

/**
 * Returns the k-th largest element via a min-heap of the k largest seen so
 * far: the root is always the eviction candidate, so popping when the heap
 * exceeds k discards only elements provably outside the top k.
 * O(n log k) time, O(k) space.
 */
function findKthLargest(nums: number[], k: number): number {
  const heap = new MinHeap<number>();
  for (const x of nums) {
    heap.push(x);
    if (heap.size() > k) heap.pop();
  }
  return heap.peek() as number;
}

/**
 * Best-first frontier walk over the (virtual) m×n grid of index pairs.
 * Seed the first min(k, m) rows at column 0; each pop pushes only its row
 * successor, so every cell has exactly one path into the heap — no
 * visited-set, no duplicates.
 * O(k log k) time, O(min(k, m)) heap space.
 */
function kSmallestPairs(nums1: number[], nums2: number[], k: number): number[][] {
  const result: number[][] = [];
  if (nums1.length === 0 || nums2.length === 0 || k <= 0) return result;

  const heap = new MinHeap<[number, number]>(
    (a, b) => nums1[a[0]] + nums2[a[1]] - (nums1[b[0]] + nums2[b[1]]),
  );
  const rows = Math.min(k, nums1.length);
  for (let i = 0; i < rows; i++) heap.push([i, 0]);

  while (result.length < k && heap.size() > 0) {
    const [i, j] = heap.pop() as [number, number];
    result.push([nums1[i], nums2[j]]);
    if (j + 1 < nums2.length) heap.push([i, j + 1]);
  }
  return result;
}

interface MedianStream {
  addNum(num: number): void;
  findMedian(): number;
}

/**
 * Streaming median over two heaps. Invariants: every element of `low`
 * (max-heap, smaller half) <= every element of `high` (min-heap, larger
 * half), and low.size() - high.size() is 0 or 1. The roots then bracket
 * the middle of the sorted order at all times.
 * addNum O(log n), findMedian O(1).
 */
class MedianFinder implements MedianStream {
  private low = new MinHeap<number>((a, b) => b - a); // max-heap: smaller half
  private high = new MinHeap<number>(); // min-heap: larger half

  addNum(num: number): void {
    if (this.low.size() === 0 || num <= (this.low.peek() as number)) {
      this.low.push(num);
    } else {
      this.high.push(num);
    }
    // Rebalance with at most one root transfer; ordering survives because
    // only boundary elements cross.
    if (this.low.size() > this.high.size() + 1) {
      this.high.push(this.low.pop() as number);
    } else if (this.high.size() > this.low.size()) {
      this.low.push(this.high.pop() as number);
    }
  }

  findMedian(): number {
    if (this.low.size() > this.high.size()) return this.low.peek() as number;
    return ((this.low.peek() as number) + (this.high.peek() as number)) / 2;
  }
}

export { MinHeap, findKthLargest, kSmallestPairs, MedianFinder };

function main() {
  const h = new MinHeap<number>();
  h.push(5); h.push(1); h.push(3);
  console.log(h.pop(), h.pop(), h.pop()); // 1 3 5

  console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2)); // 5

  console.log(JSON.stringify(kSmallestPairs([1, 7, 11], [2, 4, 6], 3))); // [[1,2],[1,4],[1,6]]

  const mf = new MedianFinder();
  mf.addNum(1); mf.addNum(2);
  console.log(mf.findMedian()); // 1.5
  mf.addNum(3);
  console.log(mf.findMedian()); // 2
}

main();
