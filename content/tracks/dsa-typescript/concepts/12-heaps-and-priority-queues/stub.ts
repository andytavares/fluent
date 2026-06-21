// Run: tsx stub.ts

export class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

// Generic min-heap backed by an array.
// comparator(a, b) < 0 means a should be above b in the heap (closer to root).
export class MinHeap<T> {
  private data: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  push(_val: T): void {
    // TODO: append to data[], then bubbleUp from the last index
  }

  pop(): T | undefined {
    // TODO: save data[0]; move last element to root; sinkDown(0); return saved root
    return undefined;
  }

  peek(): T | undefined {
    // TODO: return data[0]
    return undefined;
  }

  size(): number {
    // TODO: return data.length
    return 0;
  }

  private bubbleUp(_i: number): void {
    // TODO: compare with parent (Math.floor((i-1)/2)); swap if out of order; repeat
  }

  private sinkDown(_i: number): void {
    // TODO: find smallest among i, left (2i+1), right (2i+2); swap if needed; repeat
  }
}

// Return the k largest elements from nums in any order.
export function kLargestElements(nums: number[], k: number): number[] {
  // TODO: min-heap of size k; evict smallest when size exceeds k
  return [];
}

// Merge k sorted linked lists and return the sorted merged head.
export function mergeKSortedLists(lists: (ListNode | null)[]): ListNode | null {
  // TODO: push all list heads into a min-heap keyed by value;
  // repeatedly extract min and push its .next
  return null;
}

// Usage examples (uncomment to test manually):
// const h = new MinHeap<number>((a, b) => a - b);
// h.push(3); h.push(1); h.push(2); console.log(h.pop()); // 1
// console.log(kLargestElements([3,2,1,5,6,4], 2)); // [5,6]
