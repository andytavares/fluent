import { Trie, WordDictionary } from "./stub";

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

// ── Trie: insert + search (exact match) ──
test("Trie: search finds an inserted word", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.search("apple"), true);
});
test("Trie: search rejects a prefix of an inserted word", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.search("app"), false);
});
test("Trie: search rejects a word never inserted", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.search("banana"), false);
});
test("Trie: search finds a prefix once it is inserted itself", () => {
  const t = new Trie();
  t.insert("apple");
  t.insert("app");
  assertEqual(t.search("app"), true);
});
test("Trie: single-character word", () => {
  const t = new Trie();
  t.insert("a");
  assertEqual(t.search("a"), true);
  assertEqual(t.search("ab"), false);
});
test("Trie: query longer than every stored word", () => {
  const t = new Trie();
  t.insert("cat");
  assertEqual(t.search("catfish"), false);
});
test("Trie: words sharing a prefix are all found", () => {
  const t = new Trie();
  ["car", "card", "care", "careful"].forEach((w) => t.insert(w));
  assertEqual(t.search("car"), true);
  assertEqual(t.search("card"), true);
  assertEqual(t.search("careful"), true);
  assertEqual(t.search("ca"), false);
  assertEqual(t.search("cards"), false);
});
test("Trie: inserting the same word twice is harmless", () => {
  const t = new Trie();
  t.insert("dog");
  t.insert("dog");
  assertEqual(t.search("dog"), true);
  assertEqual(t.search("do"), false);
});

// ── Trie: startsWith ──
test("Trie: startsWith true for a proper prefix", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.startsWith("app"), true);
});
test("Trie: startsWith true for the exact word", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.startsWith("apple"), true);
});
test("Trie: startsWith false for a non-matching prefix", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.startsWith("xyz"), false);
});
test("Trie: startsWith false on an empty trie", () => {
  const t = new Trie();
  assertEqual(t.startsWith("a"), false);
});
test("Trie: startsWith false when prefix is longer than any word", () => {
  const t = new Trie();
  t.insert("cat");
  assertEqual(t.startsWith("catfish"), false);
});
test("Trie: canonical interface example", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.search("apple"), true);
  assertEqual(t.search("app"), false);
  assertEqual(t.startsWith("app"), true);
  t.insert("app");
  assertEqual(t.search("app"), true);
});

// ── WordDictionary: literal search ──
test("WordDictionary: canonical example", () => {
  const d = new WordDictionary();
  d.addWord("bad");
  d.addWord("dad");
  d.addWord("mad");
  assertEqual(d.search("pad"), false);
  assertEqual(d.search("bad"), true);
  assertEqual(d.search(".ad"), true);
  assertEqual(d.search("b.."), true);
});
test("WordDictionary: search before any addWord is false", () => {
  const d = new WordDictionary();
  assertEqual(d.search("a"), false);
  assertEqual(d.search("."), false);
});
test("WordDictionary: literal search rejects a prefix", () => {
  const d = new WordDictionary();
  d.addWord("badge");
  assertEqual(d.search("bad"), false);
  assertEqual(d.search("badge"), true);
});

// ── WordDictionary: wildcard search ──
test("WordDictionary: all-dots pattern matches any word of that length", () => {
  const d = new WordDictionary();
  d.addWord("bad");
  assertEqual(d.search("..."), true);
  assertEqual(d.search(".."), false);
  assertEqual(d.search("...."), false);
});
test("WordDictionary: dot in the last position still requires a word end", () => {
  const d = new WordDictionary();
  d.addWord("badge");
  assertEqual(d.search("ba."), false); // "bad" is only a prefix
  d.addWord("bad");
  assertEqual(d.search("ba."), true);
});
test("WordDictionary: dot in the first position", () => {
  const d = new WordDictionary();
  d.addWord("dad");
  assertEqual(d.search(".ad"), true);
  assertEqual(d.search(".bd"), false);
});
test("WordDictionary: pattern length must match word length", () => {
  const d = new WordDictionary();
  d.addWord("bad");
  assertEqual(d.search("b..."), false);
  assertEqual(d.search("b."), false);
});
test("WordDictionary: failed branch must not stop the search", () => {
  const d = new WordDictionary();
  d.addWord("and"); // 'a' branch dies at pattern ".nk"
  d.addWord("ink");
  assertEqual(d.search(".nk"), true);
});
test("WordDictionary: mixed dots and literals", () => {
  const d = new WordDictionary();
  d.addWord("apple");
  d.addWord("ample");
  assertEqual(d.search("a.ple"), true);
  assertEqual(d.search(".pple"), true);
  assertEqual(d.search("a..le"), true);
  assertEqual(d.search("a..lo"), false);
});
test("WordDictionary: single-character word and dot", () => {
  const d = new WordDictionary();
  d.addWord("z");
  assertEqual(d.search("."), true);
  assertEqual(d.search("z"), true);
  assertEqual(d.search("a"), false);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
