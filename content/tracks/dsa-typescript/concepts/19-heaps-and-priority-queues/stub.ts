// Run: npx tsx stub.ts

/**
 * An array-backed binary min-heap.
 * compare(a, b) < 0 means a sits above b; default is a numeric min-heap.
 * Index math: parent (i-1)>>1, children 2i+1 and 2i+2.
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
    // TODO: append value, then sift up — swap with the parent while
    // compare(items[i], items[parent]) < 0
  }

  pop(): T | undefined {
    // TODO: save items[0]; move the LAST element to index 0 (only if the
    // heap is non-empty after the removal!), sift down toward the smaller
    // child, and return the saved top. Empty heap → undefined.
    return undefined;
  }
}

/**
 * Returns the k-th largest element of nums (duplicates count separately).
 */
function findKthLargest(nums: number[], k: number): number {
  // TODO: min-heap of the k largest — push each num, pop when size() > k;
  // the root is the answer
  return 0;
}

/**
 * Returns the k pairs [u, v] (u from nums1, v from nums2) with the smallest
 * sums, ordered by sum ascending. Fewer than k pairs exist → return all.
 */
function kSmallestPairs(nums1: number[], nums2: number[], k: number): number[][] {
  // TODO: heap of [i, j] index pairs compared by nums1[i] + nums2[j];
  // seed (i, 0) for the first min(k, nums1.length) rows, then pop and
  // push only the row successor (i, j + 1)
  return [];
}

/**
 * Streaming median over two heaps: a max-heap `low` (smaller half) and a
 * min-heap `high` (larger half); low may hold at most one extra element.
 */
class MedianFinder {
  constructor() {
    // TODO: this.low = new MinHeap<number>((a, b) => b - a); this.high = new MinHeap<number>();
  }

  addNum(num: number): void {
    // TODO: push into low when empty or num <= low.peek(), else into high;
    // then rebalance — low may exceed high by at most one, high never leads
  }

  findMedian(): number {
    // TODO: odd count → low.peek(); even → (low.peek() + high.peek()) / 2
    return 0;
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
