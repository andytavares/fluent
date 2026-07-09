# Modules

## What you'll learn

The final lesson of the track: how to package everything you've built — functions, constants, factories like lesson 4's `createLogger`-style closures — into modules other files can import. ES modules (ESM) are the standard — used in browsers, Deno, and modern Node.js. CommonJS (`require`/`module.exports`) is Node.js's older system and still common in server code (every earlier lesson's test file used it). Knowing both is essential.

## Key concepts

**Named exports and imports:**
```js
// math.js
export function add(a, b) { return a + b; }
export const PI = 3.14159;

// main.js
import { add, PI } from "./math.js";
import { add as sum } from "./math.js";  // rename with 'as'
```

**Default exports** — one per module, imported under any name:
```js
// logger.js
export default function log(msg) { console.log(msg); }

// main.js
import log from "./logger.js";       // any name works
import myLog from "./logger.js";     // same module, different local name
```
A module can have both: `import defaultThing, { named } from "./mod.js"`.

**Re-exporting:**
```js
// index.js — barrel file
export { add, PI } from "./math.js";
export { default as log } from "./logger.js";
```

**Dynamic import (lazy loading):**
```js
const { heavyLib } = await import("./heavy.js");
```

**CommonJS (Node.js legacy):**
```js
// exports
module.exports = { add, PI };

// imports
const { add } = require("./math");
```

**`import.meta.url` and `__dirname` / `__filename`:**
- ESM: `import.meta.url` gives the current module's URL
- CommonJS: `__filename` and `__dirname` give the file path (not available in ESM)

**vs other languages:** Go packages use directory-based imports. Java uses classpath + `import` declarations. Python uses `import` with module paths. TypeScript uses the same ESM syntax with type-only imports (`import type { Foo } from "..."`) and declaration files (`.d.ts`) for external packages.

## Watch out

- ESM imports are static and hoisted — you can't conditionally `import` at the top level (use dynamic `import()` for that).
- Named vs default confusion is the classic bug: `import { thing }` needs `export const thing`; `import thing` needs `export default`. Mixing them up gives `undefined`, not always an error.
- You can't `require()` an ES module, and ESM import of a CommonJS module exposes `module.exports` as the *default* export.
- Exports are live bindings, not copies — if a module reassigns an exported `let`, importers see the new value.

## The task

You're publishing a small math-utilities module using ES module syntax. This task is about the export forms as much as the function bodies: it needs **named function exports**, a **named constant export**, a **factory function export**, and a **default export**, all from one file.

**Named export `clamp(n, min, max)`** — returns `n` constrained to the inclusive range `[min, max]`: `min` if `n < min`, `max` if `n > max`, otherwise `n`. Assume `min <= max`.

```js
clamp(-5, 0, 10);  // 0
clamp(15, 0, 10);  // 10
clamp(5, 0, 10);   // 5
clamp(0, 0, 10);   // 0  — boundaries are inclusive
clamp(10, 0, 10);  // 10
```

**Named export `lerp(a, b, t)`** — linear interpolation: returns the value a fraction `t` of the way from `a` to `b`, computed as `a + (b - a) * t`. `t = 0` gives `a`, `t = 1` gives `b`, `t = 0.5` gives the midpoint; `t` outside `[0, 1]` extrapolates beyond the endpoints (no clamping).

```js
lerp(0, 100, 0);    // 0    — t=0 → a
lerp(0, 100, 1);    // 100  — t=1 → b
lerp(0, 100, 0.5);  // 50   — midpoint
lerp(-10, 10, 0.5); // 0
lerp(0, 10, 2);     // 20   — t > 1 extrapolates
```

**Named export `VERSION`** — a constant with the exact string value `"1.0.0"`.

**Named export `createLogger(prefix)`** — a factory that returns an object with two methods. Both **return** their formatted string (they do not call `console.log` — returning keeps them testable):

- `log(msg)` — returns `"[{prefix}] {msg}"` (prefix in square brackets, one space, then the message)
- `error(msg)` — returns `"[{prefix}][ERROR] {msg}"`

```js
const logger = createLogger("APP");
logger.log("hello");   // "[APP] hello"
logger.error("boom");  // "[APP][ERROR] boom"
```

**Default export** — an object `{ clamp, lerp, VERSION }` bundling the utilities above, so consumers can write either `import { clamp } from "./stub.js"` or `import MathUtils from "./stub.js"` and get the same behavior.

```js
import MathUtils, { clamp, VERSION } from "./stub.js";
MathUtils.clamp(15, 0, 10);  // 10 — same function as the named export
MathUtils.lerp(0, 100, 0.5); // 50
MathUtils.VERSION;           // "1.0.0"
```
