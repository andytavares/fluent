## What you build

You write a strict integer parser, a JSON parser that returns errors as values, and a retry helper. `retry` wraps a function that can fail, so it combines a closure with `try`/`catch`. This lesson builds on **Closures**.

## Key concepts

### `throw` raises, `try`/`catch` handles

`throw` raises an exception. `catch` handles it, and `finally` always runs, so use it for cleanup. `Error` and its subclasses carry a message and a stack trace.

```js
try {
  JSON.parse("invalid json");
} catch (e) {
  console.error(e.message);
} finally {
  // Always runs
}
```

### Subclass `Error` for domain errors

Call `super` with the message and set `name`.

```js
class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

throw new NotFoundError("User 42");
// message: "User 42 not found"
// name: "NotFoundError"
```

### Narrow a caught error, then rethrow the rest

Check the type before you act. Throw again what you cannot handle.

```js
try {
  // ...
} catch (e) {
  if (e instanceof TypeError) {
    // handle it
  } else {
    throw e;
  }
}
```

### An error can be a value

A wrapper that returns `{ ok, value, error }` can be cleaner than many `try`/`catch` blocks. Go's `err` return is not in JavaScript, but this shape does the same job.

```js
function tryCatch(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (e) {
    return { ok: false, error: e };
  }
}
```

### `Number` converts the whole string

`Number(s)` converts the full string and gives `NaN` for bad input. `parseInt` stops at the first bad character. That difference matters for strict validation.

```js
// The whole string must be numeric
Number("12x");   // NaN
// Silently truncates: avoid it here
parseInt("12x"); // 12
// A number, but not an integer
Number("3.5");   // 3.5
Number.isInteger(Number("3.5")); // false
// The empty-string trap
Number("");      // 0
```

### JavaScript has no checked exceptions

Unlike Java, no signature declares its exceptions. `throw` accepts any value, not only `Error` objects. Always throw `Error` objects, so callers get a stack trace.

## Watch out

- `Number("")` and `Number("   ")` give `0`, not `NaN`. Strict parsers must reject them explicitly.
- `parseInt("12abc")` gives `12` and ignores the trailing characters. Use `Number()` with `Number.isInteger()` instead.
- `catch (e)` catches everything, including bugs like `TypeError`. Rethrow what you did not intend to handle.
- An error thrown inside `finally` replaces the original error.

## The task

Write three fault-tolerant functions in `stub.js`: a strict parser, a JSON wrapper and a retry helper.

1. `safeParseInt(s)` parses the string `s` as a base-10 integer.
2. A valid integer string is an optional leading `-` followed by digits.
3. `safeParseInt` returns the number for a valid string, and `null` for anything else.
4. `safeJsonParse(text)` parses `text` as JSON and never lets the exception escape.
5. On success, `safeJsonParse` returns `{ ok: true, value }` with the parsed result.
6. On failure, it returns `{ ok: false, error }`. `error` is the non-empty message string.
7. `retry(fn, times)` calls the function `fn()`, with no arguments, up to `times` times.
8. `retry` returns the result of the first call that does not throw.
9. If all calls throw, `retry` throws the error from the last call.

`safeParseInt` returns `null` for decimals, letters and mixed digits and letters. It also returns `null` for empty and whitespace-only strings.

`retry` stops at the first success. A success on the first try means exactly one call. You can assume `times >= 1`.

```js
safeParseInt("42")  // 42
safeParseInt("-7")  // -7
safeParseInt("0")   // 0
safeParseInt("3.5") // null
safeParseInt("abc") // null
safeParseInt("12x") // null
safeParseInt("")    // null
safeParseInt("   ") // null

safeJsonParse('{"a":1}')
// { ok: true, value: { a: 1 } }
safeJsonParse("{bad json}")
// { ok: false, error: "<message>" }

let calls = 0;
const flaky = () => {
  calls++;
  if (calls < 3) {
    throw new Error("not yet");
  }
  return "success";
};
// fn runs exactly 3 times
retry(flaky, 5) // "success"
// fn runs exactly 1 time
retry(() => "instant", 5) // "instant"

// Throws Error("always fails")
retry(() => {
  throw new Error("always fails");
}, 3);
```
