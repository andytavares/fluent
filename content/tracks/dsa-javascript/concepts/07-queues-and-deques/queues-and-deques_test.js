const assert = require("assert");
const { slidingWindowMaximum, RecentCounter, rottingOranges } = require("./stub");

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

// slidingWindowMaximum
test("slidingWindowMaximum: classic k=3", () => {
  assert.deepStrictEqual(
    slidingWindowMaximum([1, 3, -1, -3, 5, 3, 6, 7], 3),
    [3, 3, 5, 5, 6, 7]
  );
});
test("slidingWindowMaximum: k=1 returns all elements", () => {
  assert.deepStrictEqual(slidingWindowMaximum([1, -1], 1), [1, -1]);
});
test("slidingWindowMaximum: k equals array length", () => {
  assert.deepStrictEqual(slidingWindowMaximum([3, 1, 2], 3), [3]);
});
test("slidingWindowMaximum: descending array", () => {
  assert.deepStrictEqual(slidingWindowMaximum([5, 4, 3, 2, 1], 2), [5, 4, 3, 2]);
});
test("slidingWindowMaximum: ascending array", () => {
  assert.deepStrictEqual(slidingWindowMaximum([1, 2, 3, 4, 5], 3), [3, 4, 5]);
});
test("slidingWindowMaximum: all same", () => {
  assert.deepStrictEqual(slidingWindowMaximum([4, 4, 4, 4], 2), [4, 4, 4]);
});
test("slidingWindowMaximum: single element", () => {
  assert.deepStrictEqual(slidingWindowMaximum([1], 1), [1]);
});

// RecentCounter
test("RecentCounter: sequential pings", () => {
  const rc = new RecentCounter();
  assert.strictEqual(rc.ping(1), 1);
  assert.strictEqual(rc.ping(100), 2);
  assert.strictEqual(rc.ping(3001), 3);
  assert.strictEqual(rc.ping(3002), 3);
});
test("RecentCounter: ping at boundary is included", () => {
  const rc = new RecentCounter();
  rc.ping(1);
  assert.strictEqual(rc.ping(3001), 2); // 1 == 3001-3000, included
});
test("RecentCounter: ping past boundary evicts", () => {
  const rc = new RecentCounter();
  rc.ping(1);
  assert.strictEqual(rc.ping(3002), 1); // 1 < 3002-3000=2, evicted
});
test("RecentCounter: large gap resets count", () => {
  const rc = new RecentCounter();
  rc.ping(1); rc.ping(2); rc.ping(3);
  assert.strictEqual(rc.ping(10000), 1);
});
test("RecentCounter: single ping", () => {
  const rc = new RecentCounter();
  assert.strictEqual(rc.ping(500), 1);
});

// rottingOranges
test("rottingOranges: classic 4 minutes", () => {
  assert.strictEqual(rottingOranges([[2,1,1],[1,1,0],[0,1,1]]), 4);
});
test("rottingOranges: isolated fresh orange returns -1", () => {
  assert.strictEqual(rottingOranges([[2,1,1],[0,1,1],[1,0,1]]), -1);
});
test("rottingOranges: no fresh oranges returns 0", () => {
  assert.strictEqual(rottingOranges([[0,2]]), 0);
});
test("rottingOranges: single fresh orange adjacent to rotten", () => {
  assert.strictEqual(rottingOranges([[2,1]]), 1);
});
test("rottingOranges: empty grid", () => {
  assert.strictEqual(rottingOranges([[0]]), 0);
});
test("rottingOranges: all fresh no rotten", () => {
  assert.strictEqual(rottingOranges([[1,1],[1,1]]), -1);
});
test("rottingOranges: all rotten", () => {
  assert.strictEqual(rottingOranges([[2,2],[2,2]]), 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
