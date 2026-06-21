const assert = require("assert");
const { climbingStairs, rob, coinChange } = require("./stub");

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

// climbingStairs
test("climbingStairs: n=1", () => { assert.strictEqual(climbingStairs(1), 1); });
test("climbingStairs: n=2", () => { assert.strictEqual(climbingStairs(2), 2); });
test("climbingStairs: n=3", () => { assert.strictEqual(climbingStairs(3), 3); });
test("climbingStairs: n=5", () => { assert.strictEqual(climbingStairs(5), 8); });
test("climbingStairs: n=10", () => { assert.strictEqual(climbingStairs(10), 89); });
test("climbingStairs: n=4", () => { assert.strictEqual(climbingStairs(4), 5); });

// rob
test("rob: [1,2,3,1]", () => { assert.strictEqual(rob([1, 2, 3, 1]), 4); });
test("rob: [2,7,9,3,1]", () => { assert.strictEqual(rob([2, 7, 9, 3, 1]), 12); });
test("rob: single house zero", () => { assert.strictEqual(rob([0]), 0); });
test("rob: single house with value", () => { assert.strictEqual(rob([5]), 5); });
test("rob: two houses", () => { assert.strictEqual(rob([2, 3]), 3); });
test("rob: alternating high-low", () => { assert.strictEqual(rob([10, 1, 10, 1, 10]), 30); });
test("rob: all same value", () => { assert.strictEqual(rob([5, 5, 5, 5]), 10); });

// coinChange
test("coinChange: classic [1,5,11] 15", () => { assert.strictEqual(coinChange([1, 5, 11], 15), 3); });
test("coinChange: impossible", () => { assert.strictEqual(coinChange([2], 3), -1); });
test("coinChange: amount=0", () => { assert.strictEqual(coinChange([1], 0), 0); });
test("coinChange: [1,2,5] amount=11", () => { assert.strictEqual(coinChange([1, 2, 5], 11), 3); });
test("coinChange: exact single coin", () => { assert.strictEqual(coinChange([5], 5), 1); });
test("coinChange: 10+25 = 30 with [1,5,10,25]", () => { assert.strictEqual(coinChange([1, 5, 10, 25], 30), 2); });
test("coinChange: large amount", () => { assert.strictEqual(coinChange([1, 2, 5], 100), 20); });
test("coinChange: only large coin", () => { assert.strictEqual(coinChange([10], 7), -1); });

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
