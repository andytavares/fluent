function pluck(arr, key) {
  return arr.map((obj) => obj[key]);
}

function groupBy(arr, key) {
  return arr.reduce((acc, obj) => {
    const k = obj[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(obj);
    return acc;
  }, {});
}

function flatten(arr) {
  return arr.reduce((acc, sub) => acc.concat(sub), []);
}

module.exports = { pluck, groupBy, flatten };
