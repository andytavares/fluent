# Enums

## What you'll learn

The unions from lesson 3 and the guards from lesson 5 model "one of several values" as plain literal types with zero runtime footprint. Enums are TypeScript's other way to model a fixed set of named constants — but unlike almost everything else in this track, they exist at runtime as actual objects. That comes with trade-offs worth understanding before you reach for one over a union.

## Key concepts

**Numeric enums** start at 0 by default, incrementing automatically. You can override any value:

```ts
enum Direction {
  Up,     // 0
  Down,   // 1
  Left,   // 2
  Right,  // 3
}

enum StatusCode {
  OK      = 200,
  Created = 201,
  NotFound = 404,
}
```

**Reverse mapping** is a numeric-enum-only feature. TypeScript emits an object that maps both name→value and value→name:

```ts
Direction[0]         // "Up"
Direction["Up"]      // 0
Direction[Direction.Up]  // "Up"
```

**String enums** have no reverse mapping, but are easier to read in logs and serialized payloads:

```ts
enum Color {
  Red   = "RED",
  Green = "GREEN",
  Blue  = "BLUE",
}
```

**Const enums** are erased entirely at compile time — every usage is replaced with the literal value inline. This means no runtime object exists, and you cannot use reverse mapping:

```ts
const enum Axis { X, Y, Z }
const a = Axis.X;  // compiles to: const a = 0;
```

**vs JavaScript:** JavaScript has no native enum. Common JS patterns are `Object.freeze({...})` or plain constants. TypeScript enums compile to a self-referential IIFE object, which adds bundle weight. For simple cases, a union type like `type Direction = "up" | "down" | "left" | "right"` is often cleaner and more tree-shakeable — prefer union types for string values you control and enums when you need numeric codes, reverse mapping, or a shared runtime object.

## Watch out

- `Object.keys(Direction)` on a **numeric** enum returns both the string names *and* the numeric-string keys the reverse mapping adds (`["0","1","2","3","Up","Down","Left","Right"]`) — iterating naively double-counts. String enums don't have this problem since they have no reverse mapping.
- `const enum` is erased entirely by the TypeScript compiler (`tsc`), but tools that transpile file-by-file without full type information — Babel, esbuild, and by extension `tsx` (which this platform's sandbox uses) — cannot always erase them safely and may reject or mishandle `const enum` under isolated-modules mode. Prefer a regular `enum` unless you control the whole build pipeline.
- Reverse mapping only exists on **numeric** enums. `Color["Red"]` gives you `"RED"` but there is no `Color["RED"]` — string enums map name → value in one direction only.

## The task

Implement the following, using the three enums already declared in the stub file:

```ts
enum Direction { Up, Down, Left, Right }  // 0, 1, 2, 3
enum StatusCode { OK = 200, Created = 201, NotFound = 404 }
enum Color { Red = "RED", Green = "GREEN", Blue = "BLUE" }
```

**`directionLabel(d: Direction): string`** — a human-readable label for a `Direction`.

```ts
directionLabel(Direction.Up);     // "Up"
directionLabel(Direction.Down);   // "Down"
directionLabel(Direction.Left);   // "Left"
directionLabel(Direction.Right);  // "Right"
```

**`isValidDirection(value: number): boolean`** — `true` if `value` is one of `Direction`'s numeric values, using the enum's reverse mapping.

```ts
isValidDirection(0);    // true  — Direction.Up
isValidDirection(3);    // true  — Direction.Right
isValidDirection(99);   // false — no such member
isValidDirection(-1);   // false
```

**`statusMessage(code: StatusCode): string`** — the HTTP status text for a `StatusCode`.

```ts
statusMessage(StatusCode.OK);       // "OK"
statusMessage(StatusCode.Created);  // "Created"
statusMessage(StatusCode.NotFound); // "Not Found"
```

**`colorToHex(c: Color): string`** — the hex string for a `Color`.

```ts
colorToHex(Color.Red);   // "#ff0000"
colorToHex(Color.Green); // "#00ff00"
colorToHex(Color.Blue);  // "#0000ff"
```
