import { Trie, searchSuggestions } from "./stub";

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

// --- Trie ---

test("Trie: search inserted word", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.search("apple"), true);
});

test("Trie: search returns false for prefix only", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.search("app"), false);
});

test("Trie: search returns false for non-inserted word", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.search("banana"), false);
});

test("Trie: search empty string not inserted", () => {
  const t = new Trie();
  assertEqual(t.search(""), false);
});

test("Trie: search empty string after inserting it", () => {
  const t = new Trie();
  t.insert("");
  assertEqual(t.search(""), true);
});

test("Trie: multiple words, each found independently", () => {
  const t = new Trie();
  ["cat", "car", "card", "care"].forEach((w) => t.insert(w));
  assertEqual(t.search("car"), true);
  assertEqual(t.search("card"), true);
  assertEqual(t.search("cat"), true);
});

test("Trie: shorter word is not found if only longer was inserted", () => {
  const t = new Trie();
  t.insert("card");
  assertEqual(t.search("car"), false);
});

test("Trie: startsWith returns true for valid prefix", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.startsWith("app"), true);
});

test("Trie: startsWith returns true for full word", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.startsWith("apple"), true);
});

test("Trie: startsWith returns false for absent prefix", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.startsWith("ban"), false);
});

test("Trie: startsWith empty string is always true after any insert", () => {
  const t = new Trie();
  t.insert("apple");
  assertEqual(t.startsWith(""), true);
});

test("Trie: same word inserted twice, search still true", () => {
  const t = new Trie();
  t.insert("hello");
  t.insert("hello");
  assertEqual(t.search("hello"), true);
});

// --- searchSuggestions ---

test("searchSuggestions: standard case", () => {
  const products = ["mobile","mouse","moneypot","monitor","mousepad"];
  const result = searchSuggestions(products, "mouse");
  assertEqual(result, [
    ["mobile","moneypot","monitor"],
    ["mobile","moneypot","monitor"],
    ["mouse","mousepad"],
    ["mouse","mousepad"],
    ["mouse","mousepad"],
  ]);
});

test("searchSuggestions: no matches after first char", () => {
  const result = searchSuggestions(["apple","app"], "xyz");
  assertEqual(result, [[], [], []]);
});

test("searchSuggestions: exactly 3 suggestions at one level", () => {
  const products = ["a","ab","abc","abcd"];
  const result = searchSuggestions(products, "abc");
  // prefix "a" → up to 3: ["a","ab","abc"]
  assertEqual(result[0], ["a","ab","abc"]);
  // prefix "ab" → up to 3: ["ab","abc","abcd"]
  assertEqual(result[1], ["ab","abc","abcd"]);
  // prefix "abc" → up to 3: ["abc","abcd"]
  assertEqual(result[2], ["abc","abcd"]);
});

test("searchSuggestions: single product", () => {
  const result = searchSuggestions(["hello"], "hel");
  assertEqual(result, [["hello"], ["hello"], ["hello"]]);
});

test("searchSuggestions: empty product list", () => {
  const result = searchSuggestions([], "abc");
  assertEqual(result, [[], [], []]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
