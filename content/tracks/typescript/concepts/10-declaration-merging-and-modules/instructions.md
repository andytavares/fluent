# Declaration Merging & Modules

## What you'll learn

TypeScript allows multiple declarations of the same name to be merged into a single definition. This is how you augment third-party types, extend the global scope, and add properties to interfaces you don't own. It's the mechanism behind virtually every `@types/*` package.

## Key concepts

**Interface declaration merging.** Two `interface` declarations with the same name in the same scope are merged automatically:

```ts
interface Config { host: string; }
interface Config { port: number; }

const c: Config = { host: "localhost", port: 3000 };  // both required
```

**Module augmentation** — adding to an existing module's exports from outside that module:

```ts
// In your file, after importing the module:
declare module "some-library" {
  interface Options {
    retries: number;  // extend an existing interface
  }
}
```

**Namespace declarations** group related types and values under a name, and can themselves be merged with classes or functions:

```ts
namespace Validation {
  export interface Rule { test(s: string): boolean; }
  export function required(s: string): boolean { return s.length > 0; }
}
```

**`declare global`** adds to the global scope from within a module file (any file with a top-level `import` or `export`):

```ts
export {};  // makes this a module

declare global {
  interface Window {
    myAnalytics: { track(event: string): void };
  }
}
```

**Ambient declarations (`declare`)** describe shape without implementation — used for global variables injected by a build tool or runtime:

```ts
declare const __VERSION__: string;
declare function fetch(url: string): Promise<Response>;
```

**vs JavaScript:** JavaScript has no concept of declaration merging — it's purely a TypeScript type-system feature. At runtime, the emitted code is normal JS. The practical value is entirely at the type-checking layer: you can safely extend types you don't own without forking them.

## The task

Implement the following. Because module augmentation and ambient declarations can't easily be exercised at runtime, this concept's task focuses on the namespace and merging patterns that do produce testable runtime behavior.

- Declare `interface AppConfig` with `host: string` and `port: number`, then merge in a second declaration that adds `timeout: number`. Export a function `createConfig(host: string, port: number, timeout: number): AppConfig` that returns the merged shape.
- Export `namespace StringUtils` containing:
  - `function truncate(s: string, max: number): string` — truncate to `max` chars, appending `"..."` if the string was shortened
  - `function pad(s: string, length: number, char?: string): string` — left-pad `s` to `length` using `char` (default `" "`)
- Export `namespace MathUtils` containing:
  - `function clamp(n: number, min: number, max: number): number`
  - `function lerp(a: number, b: number, t: number): number` — linear interpolation
