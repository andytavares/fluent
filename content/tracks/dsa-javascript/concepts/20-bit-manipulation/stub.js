// Run: node stub.js

/**
 * Returns the sum of two binary strings as a binary string.
 * Inputs may be hundreds of digits — numeric conversion loses precision.
 * @param {string} a  '0'/'1' only, no leading zeros except "0"
 * @param {string} b
 * @returns {string}
 */
function addBinary(a, b) {
  // TODO: walk both strings from the back with a carry;
  // digit = sum & 1, carry = sum >> 1; loop while i >= 0 || j >= 0 || carry;
  // collect digits in an array and reverse-join at the end
  return "";
}

/**
 * Returns the number of set bits in the 32-bit representation of n.
 * @param {number} n  0 <= n <= 2**32 - 1
 * @returns {number}
 */
function hammingWeight(n) {
  // TODO: normalize n = n >>> 0, then clear the lowest set bit with
  // n & (n - 1) (re-apply >>> 0) until n is 0, counting iterations
  return 0;
}

/**
 * Returns the element that appears exactly once (all others appear twice).
 * O(n) time, O(1) space — no Map/Set.
 * @param {number[]} nums
 * @returns {number}
 */
function singleNumber(nums) {
  // TODO: XOR-fold the array — pairs cancel (x ^ x === 0), the singleton survives
  return 0;
}

/**
 * Returns the bitwise AND of every integer in [left, right].
 * @param {number} left   0 <= left <= right <= 2**31 - 1
 * @param {number} right
 * @returns {number}
 */
function rangeBitwiseAnd(left, right) {
  // TODO: the answer is the common binary prefix — shift both right (>>>)
  // until left === right, counting shifts, then shift back left
  return 0;
}

module.exports = { addBinary, hammingWeight, singleNumber, rangeBitwiseAnd };

function main() {
  console.log(addBinary("1010", "1011")); // 10101
  console.log(hammingWeight(11)); // 3
  console.log(hammingWeight(2147483648)); // 1
  console.log(singleNumber([4, 1, 2, 1, 2])); // 4
  console.log(rangeBitwiseAnd(5, 7)); // 4
}

main();
