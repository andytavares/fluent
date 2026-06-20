// head returns the first element of arr.
// Throws Error("empty array") if arr is empty.
function head(arr) {
  // TODO
  return undefined;
}

// tail returns all elements after the first.
// Returns [] if arr has 0 or 1 elements.
function tail(arr) {
  // TODO
  return [];
}

// unzip takes an array of [key, value] pairs and returns [keys, values].
function unzip(pairs) {
  // TODO
  return [[], []];
}

// mergeWithDefaults returns a new object with defaults overridden by overrides.
function mergeWithDefaults(defaults, overrides) {
  // TODO
  return {};
}

// sumRest returns the sum of all arguments.
function sumRest(...nums) {
  // TODO
  return 0;
}

// pluck returns an array of obj[key] for each object in arr.
function pluck(arr, key) {
  // TODO
  return [];
}

module.exports = { head, tail, unzip, mergeWithDefaults, sumRest, pluck };

// Quick demo
const [first, ...rest] = [1, 2, 3, 4];
console.log(first, rest);
console.log(mergeWithDefaults({ color: "red", size: "M" }, { color: "blue" }));
