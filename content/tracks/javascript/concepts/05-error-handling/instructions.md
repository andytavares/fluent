# Error Handling

## What you'll learn

JavaScript uses exceptions for error signaling: `throw` raises an exception, `try/catch/finally` handles it. The `Error` class and its subclasses carry a message and stack trace; you can subclass `Error` for domain-specific errors.

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

**Narrowing caught errors** — in TypeScript (and good JS), check the type before accessing properties:
```js
try {
  // ...
} catch (e) {
  if (e instanceof TypeError) { /* ... */ }
  else throw e;  // re-throw what you can't handle
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

**vs other languages:** JavaScript has no checked exceptions (like Java). `throw` can throw anything — not just `Error` instances. Convention says you should always throw `Error` objects so callers get a stack trace.

## The task

Implement three functions:

- `safeParseInt(s)` — parse `s` as a base-10 integer; return the number if valid, or `null` if `s` is not a valid integer string (hint: `Number.isInteger` and `Number.isNaN` are useful)
- `safeJsonParse(text)` — parse `text` as JSON; return `{ok: true, value}` on success, or `{ok: false, error: e.message}` on failure
- `retry(fn, times)` — call `fn()` up to `times` attempts; return the result of the first successful call; if all attempts throw, throw the last error
