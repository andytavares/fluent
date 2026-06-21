import { MinHeap, kLargestElements, mergeKSortedLists, ListNode } from "./stub";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  FAIL: ${name} — ${msg}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`expected ${b}, got ${a}`);
}

function makeList(vals: number[]): ListNode | null {
  if (vals.length === 0) return null;
  const head = new ListNode(vals[0]);
  let curr = head;
  for (let i = 1; i < vals.length; i++) {
    curr.next = new ListNode(vals[i]);
    curr = curr.next;
  }
  return head;
}

function toArray(head: ListNode | null): number[] {
  const result: number[] = [];
  let curr = head;
  while (curr !== null) { result.push(curr.val); curr = curr.next; }
  return result;
}

// --- MinHeap ---

test("MinHeap: pop returns minimum", () => {
  const h = new MinHeap<number>((a, b) => a - b);
  h.push(3); h.push(1); h.push(2);
  assertEqual(h.pop(), 1);
});

test("MinHeap: peek without removing", () => {
  const h = new MinHeap<number>((a, b) => a - b);
  h.push(5); h.push(2); h.push(8);
  assertEqual(h.peek(), 2);
  assertEqual(h.size(), 3);
});

test("MinHeap: sorted extraction order", () => {
  const h = new MinHeap<number>((a, b) => a - b);
  [5, 3, 8, 1, 4].forEach((n) => h.push(n));
  const order: number[] = [];
  while (h.size() > 0) order.push(h.pop()!);
  assertEqual(order, [1, 3, 4, 5, 8]);
});

test("MinHeap: empty pop returns undefined", () => {
  const h = new MinHeap<number>((a, b) => a - b);
  assertEqual(h.pop(), undefined);
});

test("MinHeap: single element push then pop", () => {
  const h = new MinHeap<number>((a, b) => a - b);
  h.push(42);
  assertEqual(h.pop(), 42);
  assertEqual(h.size(), 0);
});

test("MinHeap: max-heap via reversed comparator", () => {
  const h = new MinHeap<number>((a, b) => b - a);
  [3, 1, 4, 1, 5].forEach((n) => h.push(n));
  assertEqual(h.pop(), 5);
});

test("MinHeap: size tracks correctly", () => {
  const h = new MinHeap<number>((a, b) => a - b);
  assertEqual(h.size(), 0);
  h.push(1); h.push(2);
  assertEqual(h.size(), 2);
  h.pop();
  assertEqual(h.size(), 1);
});

// --- kLargestElements ---

test("kLargestElements: k=2", () => {
  const result = kLargestElements([3, 2, 1, 5, 6, 4], 2).sort((a, b) => a - b);
  assertEqual(result, [5, 6]);
});

test("kLargestElements: k=1", () => {
  const result = kLargestElements([3, 2, 1, 5, 6, 4], 1);
  assertEqual(result, [6]);
});

test("kLargestElements: k equals length", () => {
  const result = kLargestElements([1, 2, 3], 3).sort((a, b) => a - b);
  assertEqual(result, [1, 2, 3]);
});

test("kLargestElements: negative numbers", () => {
  const result = kLargestElements([-1, -5, -3, -2], 2).sort((a, b) => a - b);
  assertEqual(result, [-2, -1]);
});

test("kLargestElements: duplicates", () => {
  const result = kLargestElements([2, 2, 2, 3, 1], 3).sort((a, b) => a - b);
  assertEqual(result, [2, 2, 3]);
});

// --- mergeKSortedLists ---

test("mergeKSortedLists: three lists", () => {
  const lists = [makeList([1, 4, 5]), makeList([1, 3, 4]), makeList([2, 6])];
  assertEqual(toArray(mergeKSortedLists(lists)), [1, 1, 2, 3, 4, 4, 5, 6]);
});

test("mergeKSortedLists: empty input", () => {
  assertEqual(mergeKSortedLists([]), null);
});

test("mergeKSortedLists: single list", () => {
  assertEqual(toArray(mergeKSortedLists([makeList([1, 2, 3])])), [1, 2, 3]);
});

test("mergeKSortedLists: some lists are null", () => {
  const lists = [null, makeList([1, 3]), null, makeList([2, 4])];
  assertEqual(toArray(mergeKSortedLists(lists)), [1, 2, 3, 4]);
});

test("mergeKSortedLists: all single elements", () => {
  const lists = [makeList([3]), makeList([1]), makeList([2])];
  assertEqual(toArray(mergeKSortedLists(lists)), [1, 2, 3]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
