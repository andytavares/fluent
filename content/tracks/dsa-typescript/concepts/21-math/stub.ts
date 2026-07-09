// Run: npx tsx stub.ts

/**
 * Returns true if the integer x reads the same forwards and backwards.
 * No string conversion — digit arithmetic only.
 */
function isPalindromeNumber(x: number): boolean {
  // TODO: guard negatives and trailing zeros (except 0 itself), then
  // reverse the back half with rev = rev * 10 + x % 10 while x > rev
  return false;
}

/**
 * Returns the digit array of the given big-endian digit array plus one.
 */
function plusOne(digits: number[]): number[] {
  // TODO: walk from the last digit; digit < 9 → increment and return,
  // digit 9 → set to 0 and carry on; all nines → prepend a 1
  return [];
}

/**
 * Returns the integer square root of x, rounded down.
 * No Math.sqrt / Math.pow / ** — binary-search the answer.
 */
function mySqrt(x: number): number {
  // TODO: binary search [1, x/2] for the largest m with m * m <= x
  // (handle x < 2 first; return hi after the loop)
  return 0;
}

/**
 * Returns x raised to the integer power n in O(log |n|).
 * No Math.pow / ** — binary exponentiation.
 */
function myPow(x: number, n: number): number {
  // TODO: if n < 0, invert base once (x = 1/x, n = -n); then square-and-
  // multiply using n % 2 and Math.trunc(n / 2) — not & and >> (32-bit trap)
  return 0;
}

export { isPalindromeNumber, plusOne, mySqrt, myPow };

function main() {
  console.log(isPalindromeNumber(121)); // true
  console.log(JSON.stringify(plusOne([9, 9, 9]))); // [1,0,0,0]
  console.log(mySqrt(8)); // 2
  console.log(myPow(2, 10)); // 1024
}

main();
