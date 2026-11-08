## What you build

You publish a small math module from one file. It has named function exports, a named constant, a factory function and a default export. This lesson builds on **Destructuring & Spread**.

## Key concepts

### Two module systems

ES modules (ESM) are the standard in browsers, Deno and modern Node.js. CommonJS uses `require` and `module.exports`. It is the older Node.js system and is still common in server code. Every earlier test file in this track uses CommonJS, so you need to know both.

### Named exports keep their names

You import a named export by its name. `as` renames it.

```js
// math.js
export function add(a, b) {
  return a + b;
}
export const PI = 3.14159;

// main.js
import { add, PI } from "./math.js";
// Rename with as
import { add as sum } from "./math.js";
```

### A default export takes any name

A module has at most one default export. The importer picks the local name.

```js
// logger.js
export default function log(msg) {
  console.log(msg);
}

// main.js
import log from "./logger.js";
// Same module, another local name
import myLog from "./logger.js";
```

A module can have both: `import defaultThing, { named } from "./mod.js"`.

### A barrel file re-exports

```js
// index.js
export { add, PI } from "./math.js";
export { default as log }
  from "./logger.js";
```

### `import()` loads a module lazily

```js
const { heavyLib } =
  await import("./heavy.js");
```

### CommonJS uses `require`

```js
// Export
module.exports = { add, PI };

// Import
const { add } = require("./math");
```

### Each system finds its own location

In ESM, `import.meta.url` gives the URL of the current module. In CommonJS, `__filename` and `__dirname` give the file path. ESM has no `__filename` or `__dirname`.

### Other languages import differently

Go imports packages by directory, Java uses the classpath and `import`, and Python imports module paths. TypeScript uses ESM syntax, plus `import type { Foo } from "..."` and `.d.ts` declaration files.

## Watch out

- ESM imports are static and hoisted. You cannot `import` inside a condition at the top level; use `import()`.
- `import { thing }` needs `export const thing`. `import thing` needs `export default`. A mismatch often gives `undefined`, not an error.
- `require()` loads an ES module only in Node.js 20.19, 22.12 or later, and only without top-level `await`.
- An ESM import of a CommonJS module gives `module.exports` as the default export.
- Exports are live bindings, not copies. If a module reassigns an exported `let`, importers see the new value.

## The task

Publish a small math module from `stub.js` with ES module syntax. The export forms matter as much as the function bodies.

1. Named export `clamp(n, min, max)` returns `min` if `n < min`, `max` if `n > max`, and `n` otherwise.
2. Named export `lerp(a, b, t)` returns `a + (b - a) * t`.
3. Named export `VERSION` is the constant string `"1.0.0"`.
4. Named export `createLogger(prefix)` returns an object with the methods `log` and `error`.
5. `log(msg)` returns `"[{prefix}] {msg}"`: the prefix in square brackets, one space, then the message.
6. `error(msg)` returns `"[{prefix}][ERROR] {msg}"`.
7. The default export is the object `{ clamp, lerp, VERSION }`.

The range of `clamp` is inclusive. You can assume `min <= max`.

`lerp` is linear interpolation: the value a fraction `t` of the way from `a` to `b`. A `t` outside 0 to 1 goes past the ends, with no clamping.

`log` and `error` return the string. They do not call `console.log`, so the tests can check the result.

The default export gives the same behavior as the named exports.

```js
clamp(-5, 0, 10) // 0
clamp(15, 0, 10) // 10
clamp(5, 0, 10)  // 5
clamp(0, 0, 10)  // 0
clamp(10, 0, 10) // 10

lerp(0, 100, 0)    // 0
lerp(0, 100, 1)    // 100
lerp(0, 100, 0.5)  // 50
lerp(-10, 10, 0.5) // 0
lerp(0, 10, 2)     // 20

VERSION // "1.0.0"

const logger = createLogger("APP");
logger.log("hello")  // "[APP] hello"
logger.error("boom")
// "[APP][ERROR] boom"

import MathUtils from "./stub.js";
MathUtils.clamp(15, 0, 10)  // 10
MathUtils.lerp(0, 100, 0.5) // 50
MathUtils.VERSION           // "1.0.0"
```
