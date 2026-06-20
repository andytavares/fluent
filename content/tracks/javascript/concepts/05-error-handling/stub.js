// safeParseInt parses s as a base-10 integer, returning null if invalid.
function safeParseInt(s) {
  // TODO
  return null;
}

// safeJsonParse parses text, returning {ok,value} or {ok:false,error}.
function safeJsonParse(text) {
  // TODO
  return { ok: false, error: "not implemented" };
}

// retry calls fn up to `times` attempts, returning the first success.
// If all attempts throw, throws the last error.
function retry(fn, times) {
  // TODO
  return fn();
}

module.exports = { safeParseInt, safeJsonParse, retry };
