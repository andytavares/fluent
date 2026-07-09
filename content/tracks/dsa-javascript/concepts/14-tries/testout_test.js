const assert = require("assert");
const { Trie, WordDictionary } = require("./stub");

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

// ── Trie: insert + search (exact match) ──
test("Trie: search finds an inserted word", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.search("apple"), true);
});
test("Trie: search rejects a prefix of an inserted word", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.search("app"), false);
});
test("Trie: search rejects a word never inserted", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.search("banana"), false);
});
test("Trie: search finds a prefix once it is inserted itself", () => {
  const t = new Trie();
  t.insert("apple");
  t.insert("app");
  assert.strictEqual(t.search("app"), true);
});
test("Trie: single-character word", () => {
  const t = new Trie();
  t.insert("a");
  assert.strictEqual(t.search("a"), true);
  assert.strictEqual(t.search("ab"), false);
});
test("Trie: query longer than every stored word", () => {
  const t = new Trie();
  t.insert("cat");
  assert.strictEqual(t.search("catfish"), false);
});
test("Trie: words sharing a prefix are all found", () => {
  const t = new Trie();
  ["car", "card", "care", "careful"].forEach((w) => t.insert(w));
  assert.strictEqual(t.search("car"), true);
  assert.strictEqual(t.search("card"), true);
  assert.strictEqual(t.search("careful"), true);
  assert.strictEqual(t.search("ca"), false);
  assert.strictEqual(t.search("cards"), false);
});
test("Trie: inserting the same word twice is harmless", () => {
  const t = new Trie();
  t.insert("dog");
  t.insert("dog");
  assert.strictEqual(t.search("dog"), true);
  assert.strictEqual(t.search("do"), false);
});

// ── Trie: startsWith ──
test("Trie: startsWith true for a proper prefix", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.startsWith("app"), true);
});
test("Trie: startsWith true for the exact word", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.startsWith("apple"), true);
});
test("Trie: startsWith false for a non-matching prefix", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.startsWith("xyz"), false);
});
test("Trie: startsWith false on an empty trie", () => {
  const t = new Trie();
  assert.strictEqual(t.startsWith("a"), false);
});
test("Trie: startsWith false when prefix is longer than any word", () => {
  const t = new Trie();
  t.insert("cat");
  assert.strictEqual(t.startsWith("catfish"), false);
});
test("Trie: canonical interface example", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.search("apple"), true);
  assert.strictEqual(t.search("app"), false);
  assert.strictEqual(t.startsWith("app"), true);
  t.insert("app");
  assert.strictEqual(t.search("app"), true);
});
test("Trie: 1000 generated words, exact hits and near misses", () => {
  const t = new Trie();
  const words = [];
  let x = 1;
  for (let i = 0; i < 1000; i++) {
    // deterministic pseudo-words (Park–Miller LCG), length 3..7
    let w = "";
    const len = 3 + (i % 5);
    for (let j = 0; j < len; j++) {
      x = (x * 48271) % 2147483647;
      w += String.fromCharCode(97 + (x % 26));
    }
    words.push(w);
    t.insert(w);
  }
  for (const w of words) {
    assert.strictEqual(t.search(w), true, `expected to find ${w}`);
    assert.strictEqual(t.startsWith(w.slice(0, 2)), true);
    // longer than every stored word (max length 7) — can never collide
    assert.strictEqual(t.search(w + "aaaaaaaa"), false, `${w}aaaaaaaa should be absent`);
  }
});
test("Trie: deep word (length 200)", () => {
  const t = new Trie();
  const long = "ab".repeat(100);
  t.insert(long);
  assert.strictEqual(t.search(long), true);
  assert.strictEqual(t.search(long.slice(0, 199)), false);
  assert.strictEqual(t.startsWith(long.slice(0, 199)), true);
});

// ── WordDictionary: literal search ──
test("WordDictionary: canonical example", () => {
  const d = new WordDictionary();
  d.addWord("bad");
  d.addWord("dad");
  d.addWord("mad");
  assert.strictEqual(d.search("pad"), false);
  assert.strictEqual(d.search("bad"), true);
  assert.strictEqual(d.search(".ad"), true);
  assert.strictEqual(d.search("b.."), true);
});
test("WordDictionary: search before any addWord is false", () => {
  const d = new WordDictionary();
  assert.strictEqual(d.search("a"), false);
  assert.strictEqual(d.search("."), false);
});
test("WordDictionary: literal search rejects a prefix", () => {
  const d = new WordDictionary();
  d.addWord("badge");
  assert.strictEqual(d.search("bad"), false);
  assert.strictEqual(d.search("badge"), true);
});

// ── WordDictionary: wildcard search ──
test("WordDictionary: all-dots pattern matches any word of that length", () => {
  const d = new WordDictionary();
  d.addWord("bad");
  assert.strictEqual(d.search("..."), true);
  assert.strictEqual(d.search(".."), false);
  assert.strictEqual(d.search("...."), false);
});
test("WordDictionary: dot in the last position still requires a word end", () => {
  const d = new WordDictionary();
  d.addWord("badge");
  assert.strictEqual(d.search("ba."), false); // "bad" is only a prefix
  d.addWord("bad");
  assert.strictEqual(d.search("ba."), true);
});
test("WordDictionary: dot in the first position", () => {
  const d = new WordDictionary();
  d.addWord("dad");
  assert.strictEqual(d.search(".ad"), true);
  assert.strictEqual(d.search(".bd"), false);
});
test("WordDictionary: pattern length must match word length", () => {
  const d = new WordDictionary();
  d.addWord("bad");
  assert.strictEqual(d.search("b..."), false);
  assert.strictEqual(d.search("b."), false);
});
test("WordDictionary: failed branch must not stop the search", () => {
  const d = new WordDictionary();
  d.addWord("and"); // 'a' branch dies at pattern ".nk"
  d.addWord("ink");
  assert.strictEqual(d.search(".nk"), true);
});
test("WordDictionary: mixed dots and literals", () => {
  const d = new WordDictionary();
  d.addWord("apple");
  d.addWord("ample");
  assert.strictEqual(d.search("a.ple"), true);
  assert.strictEqual(d.search(".pple"), true);
  assert.strictEqual(d.search("a..le"), true);
  assert.strictEqual(d.search("a..lo"), false);
});
test("WordDictionary: single-character word and dot", () => {
  const d = new WordDictionary();
  d.addWord("z");
  assert.strictEqual(d.search("."), true);
  assert.strictEqual(d.search("z"), true);
  assert.strictEqual(d.search("a"), false);
});
test("WordDictionary: adversarial — many words, only the last branch matches", () => {
  const d = new WordDictionary();
  const alphabet = "abcdefghijklmnopqrstuvwxy"; // no z
  for (const a of alphabet) {
    for (const b of alphabet) {
      d.addWord(`${a}${b}k`);
    }
  }
  d.addWord("zzq");
  assert.strictEqual(d.search("..q"), true);  // only "zzq" matches
  assert.strictEqual(d.search("..k"), true);
  assert.strictEqual(d.search("..x"), false); // no word ends in x
});
test("WordDictionary: dots interleaved across shared prefixes", () => {
  const d = new WordDictionary();
  ["abcde", "abfde", "xbcdy"].forEach((w) => d.addWord(w));
  assert.strictEqual(d.search("ab.de"), true);
  assert.strictEqual(d.search(".bcd."), true);
  assert.strictEqual(d.search(".b.d."), true);
  assert.strictEqual(d.search(".b.dz"), false);
  assert.strictEqual(d.search("a...e"), true);
  assert.strictEqual(d.search("x...e"), false);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
