# Modules

## What you'll learn

JavaScript modules let you split code across files with explicit imports and exports. ES modules (ESM) are the standard — used in browsers, Deno, and modern Node.js. CommonJS (`require`/`module.exports`) is Node.js's older system and still common in server code. Knowing both is essential.

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

**Default exports:**
```js
// logger.js
export default function log(msg) { console.log(msg); }

// main.js
import log from "./logger.js";       // any name works
import myLog from "./logger.js";     // same module, different local name
```

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
exports.multiply = (a, b) => a * b;

// imports
const { add } = require("./math");
const math = require("./math");
```

**`import.meta.url` and `__dirname` / `__filename`:**
- ESM: `import.meta.url` gives the current module's URL
- CommonJS: `__filename` and `__dirname` give the file path (not available in ESM)

**vs other languages:** Go packages use directory-based imports. Java uses classpath + `import` declarations. Python uses `import` with module paths. TypeScript uses the same ESM syntax with type-only imports (`import type { Foo } from "..."`) and declaration files (`.d.ts`) for external packages.

## The task

This concept's task uses the module system itself — implement the following across two files:

In `stub.js`:
- Export a named function `clamp(n, min, max)` — constrain n to [min, max]
- Export a named function `lerp(a, b, t)` — linear interpolation
- Export a named constant `VERSION = "1.0.0"`
- Export a **default** export: an object `{ clamp, lerp, VERSION }`

In `stub.js` also export a function `createLogger(prefix)` that returns an object with:
- `log(msg)` — returns `"[prefix] msg"` (does not call console.log — returns the string for testability)
- `error(msg)` — returns `"[prefix][ERROR] msg"`
