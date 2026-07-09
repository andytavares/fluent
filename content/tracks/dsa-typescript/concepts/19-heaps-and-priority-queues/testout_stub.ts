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
  }

  pop(): T | undefined {
    return undefined;
  }
}

function findKthLargest(nums: number[], k: number): number {
  return 0;
}

function kSmallestPairs(nums1: number[], nums2: number[], k: number): number[][] {
  return [];
}

interface MedianStream {
  addNum(num: number): void;
  findMedian(): number;
}

class MedianFinder implements MedianStream {
  addNum(num: number): void {
  }

  findMedian(): number {
    return 0;
  }
}

export { MinHeap, findKthLargest, kSmallestPairs, MedianFinder };
