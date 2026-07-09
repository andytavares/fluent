// Run: npx tsx exemplar.ts

/**
 * Adds two binary strings column by column with a carry — grade-school
 * addition on characters, so 200-digit inputs are no problem (Number
 * conversion would silently round past 53 bits).
 * O(max(m, n)) time and space.
 * a, b are '0'/'1' only, no leading zeros except "0".
 */
function addBinary(a: string, b: string): string {
  const digits: number[] = [];
  let carry = 0;
  let i = a.length - 1;
  let j = b.length - 1;
  while (i >= 0 || j >= 0 || carry) {
    const sum = carry + (i >= 0 ? +a[i--] : 0) + (j >= 0 ? +b[j--] : 0);
    digits.push(sum & 1);
    carry = sum >> 1;
  }
  return digits.reverse().join("");
}

/**
 * Population count via n & (n - 1), which clears exactly the lowest set
 * bit per iteration — O(set bits), not O(32). The >>> 0 normalizations
 * keep the value unsigned so bit-31 inputs neither read negative nor
 * spin forever.
 * n must satisfy 0 <= n <= 2**32 - 1.
 */
function hammingWeight(n: number): number {
  n = n >>> 0;
  let count = 0;
  while (n !== 0) {
    n = (n & (n - 1)) >>> 0;
    count++;
  }
  return count;
}

/**
 * XOR-fold: x ^ x === 0 and x ^ 0 === x, so every pair annihilates and
 * only the singleton survives. Negatives work unchanged — XOR sees only
 * the two's-complement bit pattern.
 * O(n) time, O(1) space. nums has every element twice except one.
 */
function singleNumber(nums: number[]): number {
  return nums.reduce((acc, x) => acc ^ x, 0);
}

/**
 * AND of [left, right] is the common binary prefix of the endpoints:
 * below the highest differing bit, every pattern occurs somewhere in the
 * range, so those bits all AND to zero. Shift to the prefix, shift back.
 * O(log n) time, O(1) space. 0 <= left <= right <= 2**31 - 1.
 */
function rangeBitwiseAnd(left: number, right: number): number {
  let shift = 0;
  while (left < right) {
    left >>>= 1;
    right >>>= 1;
    shift++;
  }
  return left << shift;
}

export { addBinary, hammingWeight, singleNumber, rangeBitwiseAnd };

function main() {
  console.log(addBinary("1010", "1011")); // 10101
  console.log(hammingWeight(11)); // 3
  console.log(hammingWeight(2147483648)); // 1
  console.log(singleNumber([4, 1, 2, 1, 2])); // 4
  console.log(rangeBitwiseAnd(5, 7)); // 4
}

main();
