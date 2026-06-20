// classify returns "negative", "zero", "small" (1–9), or "large" (>=10).
function classify(n) {
  // TODO
  return "";
}

// sumArray returns the sum of all numbers in arr.
function sumArray(arr) {
  // TODO
  return 0;
}

// keyCount returns the number of own enumerable keys on obj.
function keyCount(obj) {
  // TODO
  return 0;
}

// firstEven returns the first even number in arr, or null if none.
function firstEven(arr) {
  // TODO
  return null;
}

module.exports = { classify, sumArray, keyCount, firstEven };

// Quick smoke-check — run with: node stub.js
if (require.main === module) {
  console.log(classify(-5));   // "negative"
  console.log(sumArray([1, 2, 3])); // 6
  console.log(keyCount({ a: 1, b: 2 })); // 2
  console.log(firstEven([1, 3, 4, 6])); // 4
}
