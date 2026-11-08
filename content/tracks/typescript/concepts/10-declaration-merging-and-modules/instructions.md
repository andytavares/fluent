## What you build

You write `createConfig` for a merged `AppConfig` interface, and two namespaces with helper functions. Interfaces with the same name merge into one definition. This merge lets you add to third-party and global types without a fork. Almost every `@types/*` package depends on it. This lesson builds on **Types & Interfaces**.

## Key concepts

### Interfaces with the same name merge

Two `interface` declarations with the same name in the same scope become one interface.

```ts
interface Config { host: string; }
interface Config { port: number; }

// Both fields are required
const c: Config = {
  host: "localhost",
  port: 3000,
};
```

### Module augmentation adds to another module

`declare module` adds declarations to an existing module from outside it.

```ts
// In your file, after the import:
declare module "some-library" {
  interface Options {
    // Adds to the existing interface
    retries: number;
  }
}
```

### A namespace groups types and values

A namespace collects related types and values under one name. A namespace can merge with a class or a function.

```ts
namespace Validation {
  export interface Rule {
    test(s: string): boolean;
  }
  export function required(
    s: string,
  ): boolean {
    return s.length > 0;
  }
}
```

### `declare global` adds to the global scope

It works inside a module file. A module file has a top-level `import` or `export`.

```ts
// Makes this file a module
export {};

declare global {
  interface Window {
    myAnalytics: {
      track(event: string): void;
    };
  }
}
```

### `declare` describes a shape without code

An ambient declaration describes a global value that a build tool or runtime injects.

```ts
declare const __VERSION__: string;
declare function fetch(
  url: string,
): Promise<Response>;
```

### Merging exists only in the type system

JavaScript has no declaration merging. The emitted code is normal JavaScript. You get the value at type-check time: you extend types you do not own, with no fork.

## Watch out

- Merging works for `interface`, not for `type` aliases. Two `type Config` declarations give a "Duplicate identifier" error.
- To add to a shape later, declare it with `interface`.
- Namespaces are older than ES modules. Today they serve global type augmentation and legacy code without `import`/`export`.
- For new module code, use exported functions in separate files.
- This task uses namespaces because they create real runtime objects that tests can call.
- `declare global` works only in a file that TypeScript treats as a module.

## The task

Write the runtime side of two declaration-merging patterns: interface merging and namespaces. Module augmentation and ambient `declare` exist only at compile time, so tests cannot run them.

The stub declares `AppConfig` twice. TypeScript merges the two into one interface with three fields:

```ts
interface AppConfig {
  host: string;
  port: number;
}
interface AppConfig { timeout: number; }
```

1. `createConfig(host: string, port: number, timeout: number): AppConfig` returns an object with the three fields.
2. `StringUtils.truncate(s: string, max: number): string` shortens `s` to at most `max` characters.
3. `truncate` appends `"..."` only when it shortens `s`.
4. `StringUtils.pad(s: string, length: number, char?: string): string` adds `char` on the left until `s` reaches `length`.
5. The default `char` is one space.
6. `pad` returns `s` unchanged when `s` is already `length` characters or longer.
7. `MathUtils.clamp(n: number, min: number, max: number): number` limits `n` to the range from `min` to `max`.
8. `clamp` includes both ends of the range.
9. `MathUtils.lerp(a: number, b: number, t: number): number` returns the linear interpolation `a + (b - a) * t`.

A string exactly at the limit gets no ellipsis. `lerp` works with negative ranges.

```ts
createConfig("localhost", 3000, 5000);
// { host: "localhost", port: 3000,
//   timeout: 5000 }

StringUtils.truncate("hi", 10);
// "hi"
StringUtils.truncate("hello world", 5);
// "hello..."
StringUtils.truncate("hello", 5);
// "hello"
StringUtils.truncate("", 5);  // ""

StringUtils.pad("hi", 5);     // "   hi"
StringUtils.pad("hello", 5);  // "hello"
StringUtils.pad("hello world", 3);
// "hello world"
StringUtils.pad("42", 5, "0"); // "00042"

MathUtils.clamp(-5, 0, 10);  // 0
MathUtils.clamp(15, 0, 10);  // 10
MathUtils.clamp(5, 0, 10);   // 5
MathUtils.clamp(0, 0, 10);   // 0
MathUtils.clamp(10, 0, 10);  // 10

MathUtils.lerp(0, 100, 0);    // 0
MathUtils.lerp(0, 100, 1);    // 100
MathUtils.lerp(0, 100, 0.5);  // 50
MathUtils.lerp(-10, 10, 0.5); // 0
```
