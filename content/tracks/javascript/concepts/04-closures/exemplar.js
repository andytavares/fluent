function makeCounter(start = 0) {
  let count = start;
  return () => count++;
}

function makeAdder(n) {
  return (x) => x + n;
}

function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result;
  };
}

module.exports = { makeCounter, makeAdder, once };
