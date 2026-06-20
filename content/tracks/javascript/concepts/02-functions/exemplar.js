function multiply(a, b = 1) {
  return a * b;
}

function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}

function compose(f, g) {
  return (x) => f(g(x));
}

module.exports = { multiply, sum, compose };
