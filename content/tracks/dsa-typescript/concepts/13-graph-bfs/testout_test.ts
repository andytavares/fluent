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
test("minMutation: start equals end is 0 with a populated bank", () => {
  assertEqual(minMutation("AACCGGTT", "AACCGGTT", ["AACCGGTA"]), 0);
});
test("minMutation: end gene missing from the bank", () => {
  assertEqual(minMutation("AACCGGTT", "AACCGGTA", []), -1);
});
test("minMutation: end in bank but unreachable", () => {
  assertEqual(
    minMutation("AACCTTGG", "AATTCCGG", ["AATTCCGG", "AACCTGGG", "AACCCCGG", "AACCTACC"]),
    -1,
  );
});
test("minMutation: takes the shortest of several routes", () => {
  const bank = ["AAAAAAAT", "AAAAAATT", "AAAAAAAC", "AAAAAACT", "AAAAACTT"];
  assertEqual(minMutation("AAAAAAAA", "AAAAAATT", bank), 2);
});
test("minMutation: one-step answer ignores longer paths", () => {
  const bank = ["AACCGGTA", "AACCGGAT", "AACCGGAA"];
  assertEqual(minMutation("AACCGGTT", "AACCGGTA", bank), 1);
});
test("minMutation: eight-step chain flips every position", () => {
  // AAAAAAAA -> TAAAAAAA -> TTAAAAAA -> ... -> TTTTTTTT
  const bank: string[] = [];
  for (let i = 1; i <= 8; i++) {
    bank.push("T".repeat(i) + "A".repeat(8 - i));
  }
  assertEqual(minMutation("AAAAAAAA", "TTTTTTTT", bank), 8);
});
test("minMutation: decoy branches do not distract the search", () => {
  const bank = [
    "TAAAAAAA", "TTAAAAAA", "TTTAAAAA", "TTTTAAAA", // real path prefix
    "CAAAAAAA", "CCAAAAAA", "CCCAAAAA",             // dead-end branch
    "GAAAAAAA", "GGAAAAAA",                          // another dead end
  ];
  assertEqual(minMutation("AAAAAAAA", "TTTTAAAA", bank), 4);
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
  assertEqual(
    ladderLength("hit", "cog", ["hot", "lot", "dot", "log", "dog", "cog"]),
    5,
  );
});
test("ladderLength: 101-word chain with a decoy cluster", () => {
  // Build a path from "aaaa" to "zzzz": flip position 0..3 to the next
  // letter, one flip per step — 100 edges, 101 words.
  const words: string[] = [];
  const current = ["a", "a", "a", "a"];
  for (let code = 98; code <= 122; code++) { // 'b'..'z'
    for (let pos = 0; pos < 4; pos++) {
      current[pos] = String.fromCharCode(code);
      words.push(current.join(""));
    }
  }
  // Decoy cluster: c1 + "zz" + c2 — ~674 words that attach to the chain
  // only at "zzzy"/"zzzz" (its very last edge), so wandering into them can
  // never shorten the ladder. BFS must not get lost in the branching.
  const chainSet = new Set(words);
  for (let a = 97; a <= 122; a++) {
    for (let b = 97; b <= 122; b++) {
      const w = String.fromCharCode(a) + "zz" + String.fromCharCode(b);
      if (!chainSet.has(w)) words.push(w);
    }
  }
  assertEqual(ladderLength("aaaa", "zzzz", words), 101);
});
test("ladderLength: large unreachable list returns 0 quickly", () => {
  // 600+ words, none of which connect "mmmm" to "zzzz"
  const words = ["zzzz"];
  for (let a = 97; a <= 116; a++) {
    for (let b = 97; b <= 116; b++) {
      words.push("a" + String.fromCharCode(a) + String.fromCharCode(b) + "b");
    }
  }
  assertEqual(ladderLength("mmmm", "zzzz", words), 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
