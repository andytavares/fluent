import { twoSum, groupAnagrams, longestConsecutiveSequence } from "./stub";

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

// --- twoSum ---

test("twoSum: basic case", () => {
  assertEqual(twoSum([2, 7, 11, 15], 9), [0, 1]);
});

test("twoSum: answer not at start", () => {
  assertEqual(twoSum([3, 2, 4], 6), [1, 2]);
});

test("twoSum: same value twice (must not reuse index)", () => {
  assertEqual(twoSum([3, 3], 6), [0, 1]);
});

test("twoSum: no solution", () => {
  assertEqual(twoSum([1, 2, 3], 10), null);
});

test("twoSum: negative numbers", () => {
  assertEqual(twoSum([-3, 4, 3, 90], 0), [0, 2]);
});

test("twoSum: target is zero with two zeros", () => {
  assertEqual(twoSum([0, 4, 3, 0], 0), [0, 3]);
});

test("twoSum: single element", () => {
  assertEqual(twoSum([5], 10), null);
});

// --- groupAnagrams ---

test("groupAnagrams: three groups from standard input", () => {
  const result = groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
  assertEqual(result.length, 3);
});

test("groupAnagrams: group sizes are correct", () => {
  const result = groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
  const sizes = result.map((g) => g.length).sort((a, b) => a - b);
  assertEqual(sizes, [1, 2, 3]);
});

test("groupAnagrams: single word", () => {
  const result = groupAnagrams(["abc"]);
  assertEqual(result.length, 1);
  assertEqual(result[0].length, 1);
});

test("groupAnagrams: empty input", () => {
  assertEqual(groupAnagrams([]), []);
});

test("groupAnagrams: all anagrams of each other", () => {
  const result = groupAnagrams(["abc", "bca", "cab"]);
  assertEqual(result.length, 1);
  assertEqual(result[0].length, 3);
});

test("groupAnagrams: no anagrams", () => {
  const result = groupAnagrams(["abc", "def", "ghi"]);
  assertEqual(result.length, 3);
});

test("groupAnagrams: empty strings group together", () => {
  const result = groupAnagrams(["", ""]);
  assertEqual(result.length, 1);
});

// --- longestConsecutiveSequence ---

test("longestConsecutiveSequence: standard case", () => {
  assertEqual(longestConsecutiveSequence([100, 4, 200, 1, 3, 2]), 4);
});

test("longestConsecutiveSequence: longer sequence", () => {
  assertEqual(longestConsecutiveSequence([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]), 9);
});

test("longestConsecutiveSequence: empty array", () => {
  assertEqual(longestConsecutiveSequence([]), 0);
});

test("longestConsecutiveSequence: single element", () => {
  assertEqual(longestConsecutiveSequence([42]), 1);
});

test("longestConsecutiveSequence: duplicates do not extend sequence", () => {
  assertEqual(longestConsecutiveSequence([1, 2, 2, 3]), 3);
});

test("longestConsecutiveSequence: all same", () => {
  assertEqual(longestConsecutiveSequence([5, 5, 5]), 1);
});

test("longestConsecutiveSequence: negative numbers", () => {
  assertEqual(longestConsecutiveSequence([-3, -2, -1, 0, 1]), 5);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
