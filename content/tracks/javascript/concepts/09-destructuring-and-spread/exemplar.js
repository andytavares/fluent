function head(arr) {
  const [first] = arr;
  if (arr.length === 0) throw new Error("empty array");
  return first;
}

function tail(arr) {
  const [, ...rest] = arr;
  return rest;
}

function unzip(pairs) {
  const keys = [];
  const values = [];
  for (const [k, v] of pairs) {
    keys.push(k);
    values.push(v);
  }
  return [keys, values];
}

function mergeWithDefaults(defaults, overrides) {
  return { ...defaults, ...overrides };
}

function sumRest(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

function pluck(arr, key) {
  return arr.map(({ [key]: value }) => value);
}

module.exports = { head, tail, unzip, mergeWithDefaults, sumRest, pluck };
