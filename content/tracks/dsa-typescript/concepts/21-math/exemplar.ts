// Run: npx tsx exemplar.ts

/**
 * Returns true if the integer x reads the same forwards and backwards.
 * Reverses only the back half: the loop stops once the reversed part has
 * at least as many digits as what's left, so nothing can overflow in
 * fixed-width languages and this does half the work.
 * O(log10 x) time, O(1) space.
 */
function isPalindromeNumber(x: number): boolean {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
  let rev = 0;
  while (x > rev) {
    rev = rev * 10 + (x % 10);
    x = Math.trunc(x / 10);
  }
  // even digit count → halves match; odd → drop rev's middle digit
  return x === rev || x === Math.trunc(rev / 10);
}

/**
 * Returns the digit array of the given big-endian digit array plus one.
 * Carry propagation from the back: the first non-9 digit absorbs the
 * carry; all-nines grows the array by one.
 * O(n) worst case, one digit touched in the common case.
 */
function plusOne(digits: number[]): number[] {
  const result = digits.slice();
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i] < 9) {
      result[i]++;
      return result;
    }
    result[i] = 0;
  }
  result.unshift(1);
  return result;
}

/**
 * Returns the integer square root of x, rounded down.
 * Binary search on the answer space: mid*mid <= x is monotone in mid,
 * and hi lands on the last value that satisfies it.
 * O(log x) time, O(1) space.
 */
function mySqrt(x: number): number {
  if (x < 2) return x;
  let lo = 1, hi = Math.trunc(x / 2);
  while (lo <= hi) {
    const mid = lo + Math.trunc((hi - lo) / 2);
    const sq = mid * mid;
    if (sq === x) return mid;
    if (sq < x) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return hi;
}

/**
 * Returns x raised to the integer power n by binary exponentiation.
 * One squaring per binary digit of n; n % 2 and Math.trunc(n / 2) instead
 * of bitwise ops, which would corrupt |n| >= 2^31.
 * O(log |n|) time, O(1) space.
 */
function myPow(x: number, n: number): number {
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }
  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) result *= x;
    x *= x;
    n = Math.trunc(n / 2);
  }
  return result;
}

export { isPalindromeNumber, plusOne, mySqrt, myPow };

function main() {
  console.log(isPalindromeNumber(121)); // true
  console.log(JSON.stringify(plusOne([9, 9, 9]))); // [1,0,0,0]
  console.log(mySqrt(8)); // 2
  console.log(myPow(2, 10)); // 1024
}

main();
