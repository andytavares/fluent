function safeParseInt(s) {
  const n = Number(s);
  if (!Number.isInteger(n) || s.trim() === "") return null;
  return n;
}

function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function retry(fn, times) {
  let lastError;
  for (let i = 0; i < times; i++) {
    try {
      return fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

module.exports = { safeParseInt, safeJsonParse, retry };
