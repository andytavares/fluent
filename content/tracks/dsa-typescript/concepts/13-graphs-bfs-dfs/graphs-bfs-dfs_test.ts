import { numIslands, canFinish, wordLadderLength } from "./stub";

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

function copyGrid(grid: string[][]): string[][] {
  return grid.map((row) => [...row]);
}

// --- numIslands ---

test("numIslands: two islands", () => {
  const g = [["1","1","0"],["0","1","0"],["0","0","1"]];
  assertEqual(numIslands(copyGrid(g)), 2);
});

test("numIslands: one large island plus isolated", () => {
  const g = [["1","1","1"],["1","1","0"],["0","0","1"]];
  assertEqual(numIslands(copyGrid(g)), 2);
});

test("numIslands: no islands", () => {
  assertEqual(numIslands([["0","0"],["0","0"]]), 0);
});

test("numIslands: all land, one island", () => {
  assertEqual(numIslands([["1","1"],["1","1"]]), 1);
});

test("numIslands: single land cell", () => {
  assertEqual(numIslands([["1"]]), 1);
});

test("numIslands: single water cell", () => {
  assertEqual(numIslands([["0"]]), 0);
});

test("numIslands: checkerboard — 5 islands", () => {
  const g = [["1","0","1"],["0","1","0"],["1","0","1"]];
  assertEqual(numIslands(copyGrid(g)), 5);
});

// --- canFinish ---

test("canFinish: simple chain", () => {
  assertEqual(canFinish(2, [[1, 0]]), true);
});

test("canFinish: direct cycle", () => {
  assertEqual(canFinish(2, [[1, 0], [0, 1]]), false);
});

test("canFinish: no prerequisites", () => {
  assertEqual(canFinish(5, []), true);
});

test("canFinish: single course", () => {
  assertEqual(canFinish(1, []), true);
});

test("canFinish: longer chain no cycle", () => {
  assertEqual(canFinish(4, [[1, 0], [2, 1], [3, 2]]), true);
});

test("canFinish: cycle in longer chain", () => {
  assertEqual(canFinish(3, [[0, 1], [1, 2], [2, 0]]), false);
});

test("canFinish: disconnected, all valid", () => {
  assertEqual(canFinish(4, [[1, 0], [3, 2]]), true);
});

// --- wordLadderLength ---

test("wordLadderLength: classic 5-step sequence", () => {
  assertEqual(
    wordLadderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"]),
    5
  );
});

test("wordLadderLength: endWord not in wordList", () => {
  assertEqual(wordLadderLength("hit", "cog", ["hot","dot","dog","lot","log"]), 0);
});

test("wordLadderLength: no path", () => {
  assertEqual(wordLadderLength("hit", "cog", ["hot","dot","dog","lot","log","xyz"]), 0);
});

test("wordLadderLength: one step", () => {
  // "abc" → "abz" in one change, length 2
  assertEqual(wordLadderLength("abc", "abz", ["abz"]), 2);
});

test("wordLadderLength: beginWord equals endWord", () => {
  // Degenerate: if begin === end and end is in wordList, length is 1
  // (no transformation needed; convention is the sequence length = 1)
  // Most implementations return 1 here. We test 0 steps of actual change.
  // Standard LeetCode 127 says begin != end so we test a two-letter swap.
  assertEqual(wordLadderLength("hot", "dog", ["hot","dot","dog"]), 3);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
