function classify(n) {
  if (n < 0) return "negative";
  if (n === 0) return "zero";
  if (n <= 9) return "small";
  return "large";
}

function sumArray(arr) {
  let total = 0;
  for (const n of arr) {
    total += n;
  }
  return total;
}

function keyCount(obj) {
  let count = 0;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) count++;
  }
  return count;
}

function firstEven(arr) {
  for (const n of arr) {
    if (n % 2 === 0) return n;
  }
  return null;
}

module.exports = { classify, sumArray, keyCount, firstEven };
