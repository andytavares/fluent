function typeLabel(value) {
  return typeof value;
}

function strictEquals(a, b) {
  return a === b;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

module.exports = { typeLabel, strictEquals, clamp };
