import { minMutation, ladderLength } from "./stub";

let passed = 0, failed = 0;

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
  if (actual !== expected) throw new Error(`expected ${expected}, got ${actual}`);
}

// ── minMutation ──
test("minMutation: single mutation", () => {
  assertEqual(minMutation("AACCGGTT", "AACCGGTA", ["AACCGGTA"]), 1);
});
test("minMutation: two mutations through the bank", () => {
  assertEqual(
    minMutation("AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA", "AAACGGTA"]),
    2,
  );
});
test("minMutation: start equals end is 0 even with an empty bank", () => {
  assertEqual(minMutation("AACCGGTT", "AACCGGTT", []), 0);
});
test("minMutation: end gene missing from the bank", () => {
  assertEqual(minMutation("AACCGGTT", "AACCGGTA", []), -1);
});
test("minMutation: end in bank but unreachable", () => {
  // start and end differ in 4 positions; no intermediate in the bank connects them
  assertEqual(
    minMutation("AACCTTGG", "AATTCCGG", ["AATTCCGG", "AACCTGGG", "AACCCCGG", "AACCTACC"]),
    -1,
  );
});
test("minMutation: takes the shortest of several routes", () => {
  // direct: AAAAAAAA -> AAAAAAAT -> AAAAAATT (2); the CT detour is longer
  const bank = ["AAAAAAAT", "AAAAAATT", "AAAAAAAC", "AAAAAACT", "AAAAACTT"];
  assertEqual(minMutation("AAAAAAAA", "AAAAAATT", bank), 2);
});
test("minMutation: one-step answer ignores longer paths", () => {
  const bank = ["AACCGGTA", "AACCGGAT", "AACCGGAA"];
  assertEqual(minMutation("AACCGGTT", "AACCGGTA", bank), 1);
});

// ── ladderLength ──
test("ladderLength: classic five-word ladder", () => {
  assertEqual(
    ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]),
    5,
  );
});
test("ladderLength: end word missing from the list", () => {
  assertEqual(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"]), 0);
});
test("ladderLength: adjacent single-letter words", () => {
  assertEqual(ladderLength("a", "c", ["a", "b", "c"]), 2);
});
test("ladderLength: both words listed but no bridge exists", () => {
  assertEqual(ladderLength("hot", "dog", ["hot", "dog"]), 0);
});
test("ladderLength: three-word chain through one intermediate", () => {
  assertEqual(ladderLength("hot", "dog", ["hot", "dog", "dot"]), 3);
});
test("ladderLength: begin word need not be in the list", () => {
  assertEqual(ladderLength("red", "tad", ["ted", "tad"]), 3);
});
test("ladderLength: two equally short routes still return the length", () => {
  // hit -> hot -> {dot|lot} -> {dog|log} -> cog
  assertEqual(
    ladderLength("hit", "cog", ["hot", "lot", "dot", "log", "dog", "cog"]),
    5,
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
