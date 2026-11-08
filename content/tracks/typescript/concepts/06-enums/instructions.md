## What you build

You write four functions over three enums: `Direction`, `StatusCode` and `Color`. An enum is a fixed set of named constants. Unlike unions, enums exist at runtime as real objects, with trade-offs to know before you choose one. This lesson builds on **Union Types & Narrowing** and **Type Guards**.

## Key concepts

### Numeric enums count up from 0

Each member gets the next number. You can set any value.

```ts
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}

enum StatusCode {
  OK = 200,
  Created = 201,
  NotFound = 404,
}
```

### Numeric enums map in both directions

TypeScript emits an object that maps name to value and value to name. This reverse mapping exists only for numeric enums.

```ts
Direction[0];            // "Up"
Direction["Up"];         // 0
Direction[Direction.Up]; // "Up"
```

### String enums map one way

String enums have no reverse mapping. Their values are easier to read in logs and serialized payloads.

```ts
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}
```

### `const enum` disappears at compile time

The compiler replaces each use with the literal value. No runtime object exists, so reverse mapping is not possible.

```ts
const enum Axis { X, Y, Z }
// Compiles to: const a = 0;
const a = Axis.X;
```

### Choose a union or an enum

JavaScript has no enum. JavaScript code uses `Object.freeze({...})` or plain constants. A TypeScript enum compiles to a self-referencing IIFE object, which adds bundle weight. A union such as `"up" | "down"` is cleaner and easier to tree-shake. Use unions for string values you control. Use enums for numeric codes, reverse mapping or a shared runtime object.

## Watch out

- `Object.keys(Direction)` returns the names and the numeric-string keys. A naive loop counts each member twice.
- The result is `["0","1","2","3","Up","Down","Left","Right"]`. String enums do not have this problem.
- `tsc` erases `const enum`. Babel, esbuild and `tsx` compile one file at a time.
- Under isolated-modules mode, those tools can reject or mishandle `const enum`. This platform's sandbox uses `tsx`.
- Use a regular `enum` unless you control the whole build pipeline.
- `Color["Red"]` gives `"RED"`, but `Color["RED"]` does not exist. Only numeric enums map in both directions.

## The task

Write four functions. Use the three enums that the stub already declares:

```ts
// Up = 0, Down = 1, Left = 2, Right = 3
enum Direction { Up, Down, Left, Right }
enum StatusCode {
  OK = 200,
  Created = 201,
  NotFound = 404,
}
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}
```

1. `directionLabel(d: Direction): string` returns the member name, such as `"Up"`.
2. `isValidDirection(value: number): boolean` returns `true` if `value` is one of the `Direction` values.
3. Use the reverse mapping of `Direction` in `isValidDirection`.
4. `statusMessage(code: StatusCode): string` returns the HTTP status text.
5. The status texts are `"OK"`, `"Created"` and `"Not Found"`.
6. `colorToHex(c: Color): string` returns the hex string for the color.

Numbers outside 0 to 3, including negative numbers, are not valid directions.

```ts
directionLabel(Direction.Up);    // "Up"
directionLabel(Direction.Down);  // "Down"
directionLabel(Direction.Left);  // "Left"
directionLabel(Direction.Right); // "Right"

isValidDirection(0);   // true
isValidDirection(3);   // true
isValidDirection(99);  // false
isValidDirection(-1);  // false

statusMessage(StatusCode.OK);
// "OK"
statusMessage(StatusCode.Created);
// "Created"
statusMessage(StatusCode.NotFound);
// "Not Found"

colorToHex(Color.Red);   // "#ff0000"
colorToHex(Color.Green); // "#00ff00"
colorToHex(Color.Blue);  // "#0000ff"
```
