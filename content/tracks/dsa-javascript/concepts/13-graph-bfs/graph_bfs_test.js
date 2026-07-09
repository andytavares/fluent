const assert = require("assert");
const { minMutation, ladderLength } = require("./stub");

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

// ── minMutation ──
test("minMutation: single mutation", () => {
  assert.strictEqual(minMutation("AACCGGTT", "AACCGGTA", ["AACCGGTA"]), 1);
});
test("minMutation: two mutations through the bank", () => {
  assert.strictEqual(
    minMutation("AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA", "AAACGGTA"]),
    2,
  );
});
test("minMutation: start equals end is 0 even with an empty bank", () => {
  assert.strictEqual(minMutation("AACCGGTT", "AACCGGTT", []), 0);
});
test("minMutation: end gene missing from the bank", () => {
  assert.strictEqual(minMutation("AACCGGTT", "AACCGGTA", []), -1);
});
test("minMutation: end in bank but unreachable", () => {
  // start and end differ in 4 positions; no intermediate in the bank connects them
  assert.strictEqual(
    minMutation("AACCTTGG", "AATTCCGG", ["AATTCCGG", "AACCTGGG", "AACCCCGG", "AACCTACC"]),
    -1,
  );
});
test("minMutation: takes the shortest of several routes", () => {
  // direct: AAAAAAAA -> AAAAAAAT -> AAAAAATT (2); the CT detour is longer
  const bank = ["AAAAAAAT", "AAAAAATT", "AAAAAAAC", "AAAAAACT", "AAAAACTT"];
  assert.strictEqual(minMutation("AAAAAAAA", "AAAAAATT", bank), 2);
});
test("minMutation: one-step answer ignores longer paths", () => {
  const bank = ["AACCGGTA", "AACCGGAT", "AACCGGAA"];
  assert.strictEqual(minMutation("AACCGGTT", "AACCGGTA", bank), 1);
});

// ── ladderLength ──
test("ladderLength: classic five-word ladder", () => {
  assert.strictEqual(
    ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]),
    5,
  );
});
test("ladderLength: end word missing from the list", () => {
  assert.strictEqual(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"]), 0);
});
test("ladderLength: adjacent single-letter words", () => {
  assert.strictEqual(ladderLength("a", "c", ["a", "b", "c"]), 2);
});
test("ladderLength: both words listed but no bridge exists", () => {
  assert.strictEqual(ladderLength("hot", "dog", ["hot", "dog"]), 0);
});
test("ladderLength: three-word chain through one intermediate", () => {
  assert.strictEqual(ladderLength("hot", "dog", ["hot", "dog", "dot"]), 3);
});
test("ladderLength: begin word need not be in the list", () => {
  assert.strictEqual(ladderLength("red", "tad", ["ted", "tad"]), 3);
});
test("ladderLength: two equally short routes still return the length", () => {
  // hit -> hot -> {dot|lot} -> {dog|log} -> cog
  assert.strictEqual(
    ladderLength("hit", "cog", ["hot", "lot", "dot", "log", "dog", "cog"]),
    5,
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
