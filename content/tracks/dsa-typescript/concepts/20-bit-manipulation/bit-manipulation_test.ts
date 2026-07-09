import assert from "assert";
import { addBinary, hammingWeight, singleNumber, rangeBitwiseAnd } from "./stub";

let passed = 0, failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`  FAIL: ${name} — ${e.message}`);
    failed++;
  }
}

// ── addBinary ──
test("addBinary: carry creates an extra digit", () => {
  assert.strictEqual(addBinary("11", "1"), "100");
});
test("addBinary: classic example", () => {
  assert.strictEqual(addBinary("1010", "1011"), "10101");
});
test("addBinary: zero plus zero is a single zero", () => {
  assert.strictEqual(addBinary("0", "0"), "0");
});
test("addBinary: zero plus something", () => {
  assert.strictEqual(addBinary("0", "1101"), "1101");
});
test("addBinary: cascading carries", () => {
  assert.strictEqual(addBinary("1111", "1111"), "11110");
});
test("addBinary: very different lengths", () => {
  assert.strictEqual(addBinary("100", "110010"), "110110");
});
test("addBinary: 100-digit input — numeric conversion would round", () => {
  assert.strictEqual(addBinary("1".repeat(100), "1"), "1" + "0".repeat(100));
});
test("addBinary: two long strings", () => {
  // (2^80 - 1) + (2^80 - 1) = 2^81 - 2 → "1" + 79 ones + "0"
  assert.strictEqual(addBinary("1".repeat(80), "1".repeat(80)), "1".repeat(80) + "0");
});

// ── hammingWeight ──
test("hammingWeight: 11 has three set bits", () => {
  assert.strictEqual(hammingWeight(11), 3);
});
test("hammingWeight: power of two has one", () => {
  assert.strictEqual(hammingWeight(128), 1);
});
test("hammingWeight: zero has none", () => {
  assert.strictEqual(hammingWeight(0), 0);
});
test("hammingWeight: one", () => {
  assert.strictEqual(hammingWeight(1), 1);
});
test("hammingWeight: bit 31 alone (the signed trap)", () => {
  assert.strictEqual(hammingWeight(2147483648), 1);
});
test("hammingWeight: all bits except bit 1", () => {
  assert.strictEqual(hammingWeight(4294967293), 31);
});
test("hammingWeight: all 32 bits set", () => {
  assert.strictEqual(hammingWeight(4294967295), 32);
});
test("hammingWeight: alternating bits", () => {
  assert.strictEqual(hammingWeight(2863311530), 16); // 0b10101010...10
});

// ── singleNumber ──
test("singleNumber: three elements", () => {
  assert.strictEqual(singleNumber([2, 2, 1]), 1);
});
test("singleNumber: classic example", () => {
  assert.strictEqual(singleNumber([4, 1, 2, 1, 2]), 4);
});
test("singleNumber: single element", () => {
  assert.strictEqual(singleNumber([1]), 1);
});
test("singleNumber: negative singleton", () => {
  assert.strictEqual(singleNumber([7, -3, 7]), -3);
});
test("singleNumber: singleton at the start", () => {
  assert.strictEqual(singleNumber([9, 5, 5, 8, 8]), 9);
});
test("singleNumber: singleton at the end", () => {
  assert.strictEqual(singleNumber([5, 5, 8, 8, 9]), 9);
});
test("singleNumber: zero as the singleton", () => {
  assert.strictEqual(singleNumber([3, 0, 3]), 0);
});

// ── rangeBitwiseAnd ──
test("rangeBitwiseAnd: classic example [5,7]", () => {
  assert.strictEqual(rangeBitwiseAnd(5, 7), 4);
});
test("rangeBitwiseAnd: zero range", () => {
  assert.strictEqual(rangeBitwiseAnd(0, 0), 0);
});
test("rangeBitwiseAnd: left equals right", () => {
  assert.strictEqual(rangeBitwiseAnd(6, 6), 6);
});
test("rangeBitwiseAnd: full signed-positive range", () => {
  assert.strictEqual(rangeBitwiseAnd(1, 2147483647), 0);
});
test("rangeBitwiseAnd: adjacent numbers sharing a prefix", () => {
  assert.strictEqual(rangeBitwiseAnd(10, 11), 10);
});
test("rangeBitwiseAnd: range crossing a power of two is zero", () => {
  assert.strictEqual(rangeBitwiseAnd(7, 8), 0);
});
test("rangeBitwiseAnd: power-of-two block [12,15]", () => {
  assert.strictEqual(rangeBitwiseAnd(12, 15), 12);
});
test("rangeBitwiseAnd: huge range keeps only bit 30", () => {
  assert.strictEqual(rangeBitwiseAnd(1500000000, 2000000000), 1073741824);
});
test("rangeBitwiseAnd: largest adjacent pair", () => {
  assert.strictEqual(rangeBitwiseAnd(2147483646, 2147483647), 2147483646);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
