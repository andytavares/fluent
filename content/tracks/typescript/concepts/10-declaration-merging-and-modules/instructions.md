# Declaration Merging & Modules

## What you'll learn

This closing lesson ties the track together: lesson 1 established that `interface` is structurally typed, and here you'll use that same `interface` keyword's other superpower — multiple declarations of the same name merge into a single definition. This is how you augment third-party types, extend the global scope, and add properties to interfaces you don't own, without forking them. It's the mechanism behind virtually every `@types/*` package.

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

## Watch out

- Declaration merging works for `interface`, not `type` aliases. `type Config = { host: string }; type Config = { port: number };` is a compile error ("duplicate identifier") — if you need to add to a shape later, it must be declared with `interface`.
- Namespaces predate ES modules and mostly exist today for two reasons: augmenting ambient/global types, and organizing legacy code that can't use `import`/`export`. For new code with real modules, prefer plain exported functions in separate files over namespaces — this lesson uses namespaces because they're what generates real, testable runtime objects, not because they're the modern default.
- `declare global` only works inside a file that TypeScript already treats as a module (it has a top-level `import` or `export`). Adding `declare global` to a plain script file does nothing useful — it just declares another top-level scope, not the real global one.

## The task

You're implementing the runtime-testable side of three declaration-merging patterns. (Module augmentation and ambient `declare` statements are compile-time-only and can't be exercised by running code, so this task focuses on interface merging and namespaces, which produce real objects at runtime.)

**Interface merging.** `AppConfig` is declared twice in the stub — once with `host` and `port`, once adding `timeout` — and TypeScript merges them into one interface requiring all three fields:

```ts
interface AppConfig { host: string; port: number; }
interface AppConfig { timeout: number; }
// AppConfig is now { host: string; port: number; timeout: number }
```

**`createConfig(host: string, port: number, timeout: number): AppConfig`** — returns the merged shape.

```ts
createConfig("localhost", 3000, 5000);
// { host: "localhost", port: 3000, timeout: 5000 }
```

**`namespace StringUtils`** — a namespace grouping two string helpers:

- **`truncate(s: string, max: number): string`** — shortens `s` to at most `max` characters, appending `"..."` only if it was actually shortened.
  ```ts
  StringUtils.truncate("hi", 10);          // "hi"           — under the limit, unchanged
  StringUtils.truncate("hello world", 5);  // "hello..."     — cut to 5 chars + ellipsis
  StringUtils.truncate("hello", 5);        // "hello"        — exactly at the limit, no ellipsis
  StringUtils.truncate("", 5);             // ""
  ```
- **`pad(s: string, length: number, char?: string): string`** — left-pads `s` with `char` (default `" "`) until it reaches `length`; if `s` is already that long or longer, it's returned unchanged.
  ```ts
  StringUtils.pad("hi", 5);             // "   hi"   — default space padding
  StringUtils.pad("hello", 5);          // "hello"   — already at length
  StringUtils.pad("hello world", 3);    // "hello world" — already longer than length
  StringUtils.pad("42", 5, "0");        // "00042"   — custom pad character
  ```

**`namespace MathUtils`** — a namespace grouping two numeric helpers:

- **`clamp(n: number, min: number, max: number): number`** — constrains `n` to the `[min, max]` range.
  ```ts
  MathUtils.clamp(-5, 0, 10);  // 0   — below min
  MathUtils.clamp(15, 0, 10);  // 10  — above max
  MathUtils.clamp(5, 0, 10);   // 5   — within range, unchanged
  ```
- **`lerp(a: number, b: number, t: number): number`** — linear interpolation between `a` and `b` at fraction `t`.
  ```ts
  MathUtils.lerp(0, 100, 0);    // 0    — t=0 returns a
  MathUtils.lerp(0, 100, 1);    // 100  — t=1 returns b
  MathUtils.lerp(0, 100, 0.5);  // 50   — midpoint
  MathUtils.lerp(-10, 10, 0.5); // 0    — works with negative ranges too
  ```
