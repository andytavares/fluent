# Enums

## What you'll learn

TypeScript enums let you define a set of named constants. They exist at runtime as actual objects — unlike most TypeScript constructs, enums compile to real JavaScript. That comes with trade-offs worth understanding before you use them.

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

## The task

Implement the following, using the enums defined in the stub:

- `directionLabel(d: Direction): string` — return a human-readable label: `"Up"`, `"Down"`, `"Left"`, or `"Right"`
- `isValidDirection(value: number): boolean` — return `true` if `value` is a valid `Direction` numeric value (use reverse mapping)
- `statusMessage(code: StatusCode): string` — return `"OK"` for 200, `"Created"` for 201, `"Not Found"` for 404
- `colorToHex(c: Color): string` — return `"#ff0000"` for Red, `"#00ff00"` for Green, `"#0000ff"` for Blue
