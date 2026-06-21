import { binarySearch, searchInsertPosition, findMinInRotatedArray } from "./stub";

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
  if (actual !== expected) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// --- binarySearch ---

test("binarySearch: found in middle", () => {
  assertEqual(binarySearch([1, 3, 5, 7, 9], 5), 2);
});

test("binarySearch: found at start", () => {
  assertEqual(binarySearch([1, 3, 5, 7, 9], 1), 0);
});

test("binarySearch: found at end", () => {
  assertEqual(binarySearch([1, 3, 5, 7, 9], 9), 4);
});

test("binarySearch: not found", () => {
  assertEqual(binarySearch([1, 3, 5, 7, 9], 6), -1);
});

test("binarySearch: single element found", () => {
  assertEqual(binarySearch([42], 42), 0);
});

test("binarySearch: single element not found", () => {
  assertEqual(binarySearch([42], 1), -1);
});

test("binarySearch: empty array", () => {
  assertEqual(binarySearch([], 1), -1);
});

test("binarySearch: two elements, target is first", () => {
  assertEqual(binarySearch([1, 2], 1), 0);
});

// --- searchInsertPosition ---

test("searchInsertPosition: target exists", () => {
  assertEqual(searchInsertPosition([1, 3, 5, 6], 5), 2);
});

test("searchInsertPosition: insert at beginning", () => {
  assertEqual(searchInsertPosition([1, 3, 5, 6], 0), 0);
});

test("searchInsertPosition: insert in middle", () => {
  assertEqual(searchInsertPosition([1, 3, 5, 6], 2), 1);
});

test("searchInsertPosition: insert at end", () => {
  assertEqual(searchInsertPosition([1, 3, 5, 6], 7), 4);
});

test("searchInsertPosition: single element, target less", () => {
  assertEqual(searchInsertPosition([5], 3), 0);
});

test("searchInsertPosition: single element, target greater", () => {
  assertEqual(searchInsertPosition([5], 7), 1);
});

// --- findMinInRotatedArray ---

test("findMinInRotatedArray: rotated [3,4,5,1,2]", () => {
  assertEqual(findMinInRotatedArray([3, 4, 5, 1, 2]), 1);
});

test("findMinInRotatedArray: rotated [4,5,6,7,0,1,2]", () => {
  assertEqual(findMinInRotatedArray([4, 5, 6, 7, 0, 1, 2]), 0);
});

test("findMinInRotatedArray: not rotated", () => {
  assertEqual(findMinInRotatedArray([1, 2, 3, 4, 5]), 1);
});

test("findMinInRotatedArray: single element", () => {
  assertEqual(findMinInRotatedArray([3]), 3);
});

test("findMinInRotatedArray: two elements rotated", () => {
  assertEqual(findMinInRotatedArray([2, 1]), 1);
});

test("findMinInRotatedArray: two elements not rotated", () => {
  assertEqual(findMinInRotatedArray([1, 2]), 1);
});

test("findMinInRotatedArray: min is at last position", () => {
  assertEqual(findMinInRotatedArray([2, 3, 4, 5, 1]), 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
