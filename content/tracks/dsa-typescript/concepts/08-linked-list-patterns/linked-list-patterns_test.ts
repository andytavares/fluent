import { ListNode, reverseList, hasCycle, mergeTwoSortedLists } from "./stub";

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
  while (curr !== null) {
    result.push(curr.val);
    curr = curr.next;
  }
  return result;
}

// --- reverseList ---

test("reverseList: five elements", () => {
  assertEqual(toArray(reverseList(makeList([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);
});

test("reverseList: two elements", () => {
  assertEqual(toArray(reverseList(makeList([1, 2]))), [2, 1]);
});

test("reverseList: single element", () => {
  assertEqual(toArray(reverseList(makeList([42]))), [42]);
});

test("reverseList: null input", () => {
  assertEqual(reverseList(null), null);
});

// --- hasCycle ---

test("hasCycle: no cycle", () => {
  assertEqual(hasCycle(makeList([1, 2, 3])), false);
});

test("hasCycle: null", () => {
  assertEqual(hasCycle(null), false);
});

test("hasCycle: single node, no cycle", () => {
  assertEqual(hasCycle(new ListNode(1)), false);
});

test("hasCycle: cycle at tail to head", () => {
  const head = new ListNode(1);
  const n2 = new ListNode(2);
  const n3 = new ListNode(3);
  head.next = n2;
  n2.next = n3;
  n3.next = head;
  assertEqual(hasCycle(head), true);
});

test("hasCycle: cycle in the middle", () => {
  const head = new ListNode(1);
  const n2 = new ListNode(2);
  const n3 = new ListNode(3);
  head.next = n2;
  n2.next = n3;
  n3.next = n2; // 3 → 2
  assertEqual(hasCycle(head), true);
});

// --- mergeTwoSortedLists ---

test("mergeTwoSortedLists: standard case", () => {
  const l1 = makeList([1, 2, 4]);
  const l2 = makeList([1, 3, 4]);
  assertEqual(toArray(mergeTwoSortedLists(l1, l2)), [1, 1, 2, 3, 4, 4]);
});

test("mergeTwoSortedLists: one empty", () => {
  assertEqual(toArray(mergeTwoSortedLists(null, makeList([0]))), [0]);
});

test("mergeTwoSortedLists: both empty", () => {
  assertEqual(mergeTwoSortedLists(null, null), null);
});

test("mergeTwoSortedLists: one list dominates (all smaller)", () => {
  const l1 = makeList([1, 2, 3]);
  const l2 = makeList([4, 5, 6]);
  assertEqual(toArray(mergeTwoSortedLists(l1, l2)), [1, 2, 3, 4, 5, 6]);
});

test("mergeTwoSortedLists: duplicates preserved", () => {
  const l1 = makeList([1, 1]);
  const l2 = makeList([1, 1]);
  assertEqual(toArray(mergeTwoSortedLists(l1, l2)), [1, 1, 1, 1]);
});

test("mergeTwoSortedLists: single elements", () => {
  assertEqual(toArray(mergeTwoSortedLists(makeList([5]), makeList([3]))), [3, 5]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
