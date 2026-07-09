const assert = require("assert");
const { addBinary, hammingWeight, singleNumber, rangeBitwiseAnd } = require("./stub");

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
test("addBinary: 500-digit adversarial sums match a BigInt oracle", () => {
  let seed = 11;
  const randBits = (len) => {
    let s = "1";
    for (let i = 1; i < len; i++) {
      seed = (seed * 48271) % 2147483647;
      s += seed % 2 === 0 ? "0" : "1";
    }
    return s;
  };
  for (let round = 0; round < 10; round++) {
    const a = randBits(500);
    const b = randBits(371);
    const expected = (BigInt("0b" + a) + BigInt("0b" + b)).toString(2);
    assert.strictEqual(addBinary(a, b), expected, `round ${round}`);
  }
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
test("hammingWeight: every power of two has exactly one bit", () => {
  for (let i = 0; i < 32; i++) {
    assert.strictEqual(hammingWeight(2 ** i), 1, `2**${i}`);
  }
});
test("hammingWeight: matches a string-count oracle on pseudo-random values", () => {
  let seed = 5;
  for (let i = 0; i < 200; i++) {
    seed = (seed * 48271) % 2147483647;
    const n = (seed * 2 + (i % 2)) % 2 ** 32; // exercises bit 31 too
    const expected = n.toString(2).split("").filter((c) => c === "1").length;
    assert.strictEqual(hammingWeight(n), expected, `n = ${n}`);
  }
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
test("singleNumber: large shuffled array", () => {
  // Pairs 1..5000 plus singleton 999999, deterministically interleaved.
  const nums = [];
  for (let v = 1; v <= 5000; v++) nums.push(v, 5001 - v);
  nums.splice(3777, 0, 999999);
  assert.strictEqual(singleNumber(nums), 999999);
});
test("singleNumber: pairs of negatives around a negative singleton", () => {
  assert.strictEqual(singleNumber([-1, -2, -3, -2, -1]), -3);
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
test("rangeBitwiseAnd: matches a brute-force oracle on small ranges", () => {
  let seed = 17;
  for (let i = 0; i < 100; i++) {
    seed = (seed * 48271) % 2147483647;
    const left = seed % 500;
    const width = (seed >> 3) % 40;
    const right = left + width;
    let expected = left;
    for (let x = left + 1; x <= right; x++) expected &= x;
    assert.strictEqual(rangeBitwiseAnd(left, right), expected, `[${left}, ${right}]`);
  }
});
test("rangeBitwiseAnd: near-max narrow ranges", () => {
  assert.strictEqual(rangeBitwiseAnd(2147483640, 2147483647), 2147483640);
  assert.strictEqual(rangeBitwiseAnd(2147483599, 2147483647), 2147483584);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
