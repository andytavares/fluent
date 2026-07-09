# Error Handling

## What you'll learn

JavaScript uses exceptions for error signaling: `throw` raises an exception, `try/catch/finally` handles it. The `Error` class and its subclasses carry a message and stack trace; you can subclass `Error` for domain-specific errors. This lesson also uses the closure patterns from lesson 4 — wrapping a fallible function (as `retry` does below) is closures plus try/catch.

## Key concepts

**try / catch / finally:**
```js
try {
  JSON.parse("invalid json");
} catch (e) {
  console.error(e.message);  // SyntaxError: Unexpected token i...
} finally {
  // always runs — use for cleanup
}
```

**Custom error classes:**
```js
class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

throw new NotFoundError("User 42");
// message: "User 42 not found", name: "NotFoundError"
```

**Narrowing caught errors** — check the type before acting, re-throw what you can't handle:
```js
try {
  // ...
} catch (e) {
  if (e instanceof TypeError) { /* ... */ }
  else throw e;
}
```

**Error as a value (functional style)** — sometimes a try/catch wrapper that returns `{ok, value, error}` is cleaner than scattering try/catch everywhere:
```js
function tryCatch(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (e) {
    return { ok: false, error: e };
  }
}
```

**Validating numbers** — `Number(s)` converts a whole string (returning `NaN` on garbage), while `parseInt` stops at the first invalid character. That difference matters for strict validation:
```js
Number("12x");      // NaN       — whole string must be numeric
parseInt("12x");    // 12        — silently truncates! avoid for validation
Number("3.5");      // 3.5       — valid number, but not an integer
Number.isInteger(Number("3.5")); // false
Number("");         // 0         — the empty-string trap
```

**vs other languages:** JavaScript has no checked exceptions (like Java). `throw` can throw anything — not just `Error` instances. Convention says you should always throw `Error` objects so callers get a stack trace. Go engineers: there is no `err` return convention in the language itself, but the `{ok, value, error}` shape above is the JS equivalent when you want errors as values.

## Watch out

- `Number("")` and `Number("   ")` are `0`, not `NaN` — empty and whitespace-only strings coerce to zero. Strict parsers must reject them explicitly.
- `parseInt("12abc")` returns `12` — it silently ignores trailing garbage. Use `Number()` + `Number.isInteger()` for strict validation.
- `catch (e)` catches *everything*, including programming errors like `TypeError`. Re-throw what you didn't intend to handle.
- An error thrown inside `finally` swallows the original error.

## The task

You're building three fault-tolerant utilities: a strict parser, a JSON wrapper that returns errors as values, and a retry helper.

**`safeParseInt(s)`** — strictly parses the string `s` as a base-10 integer. Returns the number if `s` is a valid integer string (an optional leading `-` followed by digits); returns `null` for anything else — floats, letters, mixed digit/letter strings, and empty or whitespace-only strings. (Beware `parseInt`'s truncation and `Number("")` returning `0`; `Number()` + `Number.isInteger()` is a solid approach.)

```js
safeParseInt("42");    // 42
safeParseInt("-7");    // -7
safeParseInt("0");     // 0
safeParseInt("3.5");   // null — not an integer
safeParseInt("abc");   // null
safeParseInt("12x");   // null — trailing garbage is invalid
safeParseInt("");      // null — empty string is NOT 0
safeParseInt("   ");   // null — whitespace-only is NOT 0
```

**`safeJsonParse(text)`** — parses `text` as JSON without letting the exception escape. On success, returns `{ ok: true, value }` where `value` is the parsed result. On failure, returns `{ ok: false, error }` where `error` is the thrown error's **message string** (non-empty).

```js
safeJsonParse('{"a":1}');   // { ok: true, value: { a: 1 } }
safeJsonParse('[1,2,3]');   // { ok: true, value: [1, 2, 3] }
safeJsonParse("{bad json}"); // { ok: false, error: "Unexpected token b ..." }
```

**`retry(fn, times)`** — calls the zero-argument function `fn()` up to `times` attempts. Returns the result of the first call that does not throw; stops retrying as soon as one succeeds (a first-try success means exactly one call). If all `times` attempts throw, re-throws the error from the **last** attempt. Assume `times >= 1`.

```js
let calls = 0;
const flaky = () => {
  calls++;
  if (calls < 3) throw new Error("not yet");
  return "success";
};
retry(flaky, 5);  // "success" — fn was called exactly 3 times

retry(() => "instant", 5);  // "instant" — called exactly once

retry(() => { throw new Error("always fails"); }, 3);
// throws Error("always fails") after 3 attempts
```
