const assert = require("assert");
const { Trie, searchSuggestions } = require("./stub");

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

// ── Trie: insert + search (exact) ──────────────────────────────────────────

test("search: returns true for inserted word", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.search("apple"), true);
});
test("search: returns false for prefix of inserted word", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.search("app"), false);
});
test("search: returns false for word not inserted", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.search("banana"), false);
});
test("search: returns true after inserting the prefix separately", () => {
  const t = new Trie();
  t.insert("apple");
  t.insert("app");
  assert.strictEqual(t.search("app"), true);
});
test("search: single character word", () => {
  const t = new Trie();
  t.insert("a");
  assert.strictEqual(t.search("a"), true);
  assert.strictEqual(t.search("ab"), false);
});
test("search: multiple words, each found", () => {
  const t = new Trie();
  ["cat", "car", "card", "care", "careful"].forEach(w => t.insert(w));
  assert.strictEqual(t.search("car"), true);
  assert.strictEqual(t.search("card"), true);
  assert.strictEqual(t.search("careful"), true);
});
test("search: multiple words, non-inserted not found", () => {
  const t = new Trie();
  ["cat", "car", "card"].forEach(w => t.insert(w));
  assert.strictEqual(t.search("ca"), false);
  assert.strictEqual(t.search("cards"), false);
});

// ── Trie: startsWith ───────────────────────────────────────────────────────

test("startsWith: returns true for prefix of inserted word", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.startsWith("app"), true);
});
test("startsWith: returns true for exact match", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.startsWith("apple"), true);
});
test("startsWith: returns false for non-matching prefix", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.startsWith("xyz"), false);
});
test("startsWith: returns true for single char prefix", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.startsWith("a"), true);
});
test("startsWith: empty trie returns false", () => {
  const t = new Trie();
  assert.strictEqual(t.startsWith("a"), false);
});
test("startsWith: prefix longer than any word returns false", () => {
  const t = new Trie();
  t.insert("cat");
  assert.strictEqual(t.startsWith("catfish"), false);
});

// ── Trie: combined scenarios ───────────────────────────────────────────────

test("combined: LeetCode canonical example", () => {
  const t = new Trie();
  t.insert("apple");
  assert.strictEqual(t.search("apple"), true);
  assert.strictEqual(t.search("app"), false);
  assert.strictEqual(t.startsWith("app"), true);
  t.insert("app");
  assert.strictEqual(t.search("app"), true);
});
test("combined: disjoint words share no prefixes", () => {
  const t = new Trie();
  t.insert("dog");
  t.insert("cat");
  assert.strictEqual(t.startsWith("do"), true);
  assert.strictEqual(t.startsWith("ca"), true);
  assert.strictEqual(t.startsWith("co"), false);
  assert.strictEqual(t.search("dog"), true);
  assert.strictEqual(t.search("do"), false);
});

// ── searchSuggestions ──────────────────────────────────────────────────────

test("searchSuggestions: LeetCode example — mobile/mouse/moneypot/monitor/mousepad", () => {
  const result = searchSuggestions(
    ["mobile", "mouse", "moneypot", "monitor", "mousepad"],
    "mouse"
  );
  assert.deepStrictEqual(result[0], ["mobile", "moneypot", "monitor"]);
  assert.deepStrictEqual(result[1], ["mobile", "moneypot", "monitor"]);
  assert.deepStrictEqual(result[2], ["mouse", "mousepad"]);
  assert.deepStrictEqual(result[3], ["mouse", "mousepad"]);
  assert.deepStrictEqual(result[4], ["mouse", "mousepad"]);
});

test("searchSuggestions: single product exact match", () => {
  const result = searchSuggestions(["havana"], "havana");
  assert.strictEqual(result.length, 6);
  result.forEach(r => assert.deepStrictEqual(r, ["havana"]));
});

test("searchSuggestions: no matching prefix returns empty arrays", () => {
  const result = searchSuggestions(["apple", "apricot"], "zebra");
  result.forEach(r => assert.deepStrictEqual(r, []));
});

test("searchSuggestions: result length equals searchWord length", () => {
  const result = searchSuggestions(["abc", "abd", "abz"], "abc");
  assert.strictEqual(result.length, 3);
});

test("searchSuggestions: at most 3 suggestions per prefix", () => {
  const result = searchSuggestions(
    ["ba", "bb", "bc", "bd", "be"],
    "b"
  );
  assert.strictEqual(result[0].length, 3);
  assert.deepStrictEqual(result[0], ["ba", "bb", "bc"]); // lexicographic first 3
});

test("searchSuggestions: lexicographic order — z before 'za' is after 'a'", () => {
  const result = searchSuggestions(["bag", "ban", "bat", "bad"], "ba");
  // sorted: bad, bag, ban, bat
  assert.deepStrictEqual(result[1], ["bad", "bag", "ban"]);
});

test("searchSuggestions: single character searchWord", () => {
  const result = searchSuggestions(["a", "b", "c", "aa"], "a");
  assert.strictEqual(result.length, 1);
  assert.deepStrictEqual(result[0], ["a", "aa"]);
});

test("searchSuggestions: prefix diverges midway — later prefixes empty", () => {
  const result = searchSuggestions(["apple"], "appz");
  // "a","ap","app" match; "appz" does not
  assert.deepStrictEqual(result[0], ["apple"]);
  assert.deepStrictEqual(result[1], ["apple"]);
  assert.deepStrictEqual(result[2], ["apple"]);
  assert.deepStrictEqual(result[3], []);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
