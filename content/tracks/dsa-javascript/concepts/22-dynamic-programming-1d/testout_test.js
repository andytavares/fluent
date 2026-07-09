const assert = require("assert");
const { climbStairs, rob, wordBreak, coinChange, lengthOfLIS } = require("./stub");

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

// ── climbStairs ──
test("climbStairs: one stair", () => {
  assert.strictEqual(climbStairs(1), 1);
});
test("climbStairs: two stairs", () => {
  assert.strictEqual(climbStairs(2), 2);
});
test("climbStairs: three stairs", () => {
  assert.strictEqual(climbStairs(3), 3);
});
test("climbStairs: five stairs", () => {
  assert.strictEqual(climbStairs(5), 8);
});
test("climbStairs: ten stairs", () => {
  assert.strictEqual(climbStairs(10), 89);
});
test("climbStairs: forty-five stairs", () => {
  assert.strictEqual(climbStairs(45), 1836311903);
});

// ── rob ──
test("rob: classic example", () => {
  assert.strictEqual(rob([1, 2, 3, 1]), 4);
});
test("rob: skip pattern pays off", () => {
  assert.strictEqual(rob([2, 7, 9, 3, 1]), 12);
});
test("rob: empty street", () => {
  assert.strictEqual(rob([]), 0);
});
test("rob: single house", () => {
  assert.strictEqual(rob([5]), 5);
});
test("rob: two houses take the larger", () => {
  assert.strictEqual(rob([2, 10]), 10);
});
test("rob: both ends beat every-other", () => {
  assert.strictEqual(rob([2, 1, 1, 2]), 4);
});
test("rob: all zeros", () => {
  assert.strictEqual(rob([0, 0, 0]), 0);
});
test("rob: 500 houses", () => {
  const street = Array.from({ length: 500 }, (_, i) => (i * 37) % 101);
  assert.strictEqual(rob(street), 15015);
});

// ── wordBreak ──
test("wordBreak: two words", () => {
  assert.strictEqual(wordBreak("leetcode", ["leet", "code"]), true);
});
test("wordBreak: word reuse", () => {
  assert.strictEqual(wordBreak("applepenapple", ["apple", "pen"]), true);
});
test("wordBreak: overlapping but unsegmentable", () => {
  assert.strictEqual(wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"]), false);
});
test("wordBreak: empty string is segmentable", () => {
  assert.strictEqual(wordBreak("", ["a"]), true);
});
test("wordBreak: single unmatched char", () => {
  assert.strictEqual(wordBreak("a", ["b"]), false);
});
test("wordBreak: greedy first match dead-ends", () => {
  assert.strictEqual(wordBreak("cars", ["car", "ca", "rs"]), true);
});
test("wordBreak: one word repeated many times", () => {
  assert.strictEqual(wordBreak("aaaa", ["a"]), true);
});
test("wordBreak: whole string is one word", () => {
  assert.strictEqual(wordBreak("dynamic", ["dynamic"]), true);
});
test("wordBreak: adversarial a...ab — hangs naive recursion", () => {
  const s = "a".repeat(60) + "b";
  assert.strictEqual(wordBreak(s, ["a", "aa", "aaa", "aaaa"]), false);
});
test("wordBreak: adversarial all-a segmentable", () => {
  const s = "a".repeat(61);
  assert.strictEqual(wordBreak(s, ["a", "aa", "aaa", "aaaa"]), true);
});

// ── coinChange ──
test("coinChange: classic example", () => {
  assert.strictEqual(coinChange([1, 2, 5], 11), 3);
});
test("coinChange: unreachable amount", () => {
  assert.strictEqual(coinChange([2], 3), -1);
});
test("coinChange: zero amount needs zero coins", () => {
  assert.strictEqual(coinChange([1], 0), 0);
});
test("coinChange: single coin exact", () => {
  assert.strictEqual(coinChange([1], 1), 1);
});
test("coinChange: greedy largest-first fails", () => {
  assert.strictEqual(coinChange([1, 5, 11], 15), 3);
});
test("coinChange: coin larger than amount", () => {
  assert.strictEqual(coinChange([5, 10], 3), -1);
});
test("coinChange: big denominations, big amount", () => {
  assert.strictEqual(coinChange([186, 419, 83, 408], 6249), 20);
});
test("coinChange: another large mixed case", () => {
  assert.strictEqual(coinChange([3, 7, 405, 436], 8839), 25);
});

// ── lengthOfLIS ──
test("lengthOfLIS: classic example", () => {
  assert.strictEqual(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]), 4);
});
test("lengthOfLIS: values revisited", () => {
  assert.strictEqual(lengthOfLIS([0, 1, 0, 3, 2, 3]), 4);
});
test("lengthOfLIS: all equal — strictness", () => {
  assert.strictEqual(lengthOfLIS([7, 7, 7, 7]), 1);
});
test("lengthOfLIS: empty array", () => {
  assert.strictEqual(lengthOfLIS([]), 0);
});
test("lengthOfLIS: single element", () => {
  assert.strictEqual(lengthOfLIS([1]), 1);
});
test("lengthOfLIS: strictly descending", () => {
  assert.strictEqual(lengthOfLIS([5, 4, 3, 2, 1]), 1);
});
test("lengthOfLIS: strictly ascending", () => {
  assert.strictEqual(lengthOfLIS([1, 2, 3, 4]), 4);
});
test("lengthOfLIS: replacement mid-run", () => {
  assert.strictEqual(lengthOfLIS([4, 10, 4, 3, 8, 9]), 3);
});
test("lengthOfLIS: 2400 elements", () => {
  const nums = Array.from({ length: 2400 }, (_, i) => (i * 9973) % 8191);
  assert.strictEqual(lengthOfLIS(nums), 110);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
