// Run: tsx exemplar.ts

export class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

export class MinHeap<T> {
  private data: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  push(val: T): void {
    this.data.push(val);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const min = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return min;
  }

  peek(): T | undefined { return this.data[0]; }
  size(): number        { return this.data.length; }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.comparator(this.data[i], this.data[parent]) < 0) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }

  private sinkDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.comparator(this.data[l], this.data[smallest]) < 0) smallest = l;
      if (r < n && this.comparator(this.data[r], this.data[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

export function kLargestElements(nums: number[], k: number): number[] {
  const heap = new MinHeap<number>((a, b) => a - b); // min-heap

  for (const num of nums) {
    heap.push(num);
    if (heap.size() > k) heap.pop(); // evict smallest; keeps only k largest
  }

  const result: number[] = [];
  while (heap.size() > 0) result.push(heap.pop()!);
  return result; // ascending order
}

export function mergeKSortedLists(lists: (ListNode | null)[]): ListNode | null {
  // Heap element: [node value, node] — value drives ordering
  const heap = new MinHeap<[number, ListNode]>((a, b) => a[0] - b[0]);

  // Seed with the head of each non-empty list
  for (const head of lists) {
    if (head !== null) heap.push([head.val, head]);
  }

  const dummy = new ListNode(0);
  let curr = dummy;

  while (heap.size() > 0) {
    const [, node] = heap.pop()!;
    curr.next = node;
    curr = curr.next;
    if (node.next !== null) heap.push([node.next.val, node.next]);
  }

  return dummy.next;
}
