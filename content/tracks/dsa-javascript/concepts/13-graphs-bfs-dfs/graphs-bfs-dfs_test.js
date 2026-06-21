const assert = require("assert");
const { numIslands, canFinish, wordLadderLength } = require("./stub");

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name} — ${e.message}`);
    failed++;
  }
}

// numIslands
test("numIslands: single island", () => {
  assert.strictEqual(numIslands([
    ["1","1","1","1","0"],
    ["1","1","0","1","0"],
    ["1","1","0","0","0"],
    ["0","0","0","0","0"]
  ]), 1);
});
test("numIslands: three islands", () => {
  assert.strictEqual(numIslands([
    ["1","1","0","0","0"],
    ["1","1","0","0","0"],
    ["0","0","1","0","0"],
    ["0","0","0","1","1"]
  ]), 3);
});
test("numIslands: no islands", () => {
  assert.strictEqual(numIslands([["0","0"],["0","0"]]), 0);
});
test("numIslands: all land is one island", () => {
  assert.strictEqual(numIslands([["1","1"],["1","1"]]), 1);
});
test("numIslands: diagonal cells not connected", () => {
  assert.strictEqual(numIslands([["1","0"],["0","1"]]), 2);
});
test("numIslands: single cell land", () => {
  assert.strictEqual(numIslands([["1"]]), 1);
});
test("numIslands: single cell water", () => {
  assert.strictEqual(numIslands([["0"]]), 0);
});

// canFinish
test("canFinish: simple linear prerequisite", () => {
  assert.strictEqual(canFinish(2, [[1, 0]]), true);
});
test("canFinish: two-node cycle", () => {
  assert.strictEqual(canFinish(2, [[1, 0], [0, 1]]), false);
});
test("canFinish: no prerequisites", () => {
  assert.strictEqual(canFinish(1, []), true);
});
test("canFinish: 4 courses DAG", () => {
  assert.strictEqual(canFinish(4, [[1,0],[2,0],[3,1],[3,2]]), true);
});
test("canFinish: 3-node cycle", () => {
  assert.strictEqual(canFinish(3, [[0,1],[1,2],[2,0]]), false);
});
test("canFinish: many isolated courses", () => {
  assert.strictEqual(canFinish(5, []), true);
});
test("canFinish: chain 0->1->2->3", () => {
  assert.strictEqual(canFinish(4, [[1,0],[2,1],[3,2]]), true);
});

// wordLadderLength
test("wordLadderLength: classic hit->cog", () => {
  assert.strictEqual(
    wordLadderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"]), 5
  );
});
test("wordLadderLength: endWord not in wordList", () => {
  assert.strictEqual(
    wordLadderLength("hit", "cog", ["hot","dot","dog","lot","log"]), 0
  );
});
test("wordLadderLength: direct one-step transform", () => {
  assert.strictEqual(wordLadderLength("a", "b", ["b"]), 2);
});
test("wordLadderLength: no path", () => {
  assert.strictEqual(wordLadderLength("hit", "cog", ["cog"]), 0);
});
test("wordLadderLength: longer path", () => {
  assert.strictEqual(
    wordLadderLength("hot", "dog", ["hot","dog","dot"]), 3
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
