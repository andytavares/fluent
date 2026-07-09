# Types & Interfaces

## What you'll learn

This is the first stop for engineers who already know JavaScript: TypeScript adds a compile-time type layer on top of the language you already write. Annotate variables, parameters, and return values with types, and the compiler rejects violations before your code ever runs — the runtime behavior underneath is unchanged JS.

## Key concepts

**Basic annotations:**
```ts
const name: string = "Alice";
const age: number = 30;
const active: boolean = true;
```

**Interfaces** describe the shape of an object:
```ts
interface User {
  id: number;
  name: string;
  email?: string;  // optional property — type is `string | undefined`
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}
```

**Type aliases** name any type, including unions and object shapes:
```ts
type Point = { x: number; y: number };
type ID = string | number;
```

An `interface` and an object-shaped `type` alias are interchangeable for most purposes — the difference that matters shows up later: interfaces of the same name **merge** (lesson 10), type aliases do not.

**vs other languages:** TypeScript uses *structural* typing, not nominal. An object satisfies an interface if it has the right shape — no `implements` declaration is required at the call site. This is sometimes called "duck typing at compile time." Coming from Java or C#, this means two unrelated interfaces with identical fields are freely interchangeable; there's no `class Foo implements Bar` ceremony to opt in.

## Watch out

- **Excess property checks only fire on object literals passed directly.** `const p: Point = { x: 1, y: 2, z: 3 }` is a compile error (unknown property `z`), but `const obj = { x: 1, y: 2, z: 3 }; const p: Point = obj;` compiles fine — TypeScript only flags literals, not variables, because structural typing allows the variable to have *extra* properties.
- **Optional (`?`) is not the same as nullable.** `email?: string` means the property may be absent or `undefined` — it does not allow `null` unless you write `string | null` explicitly.
- Structural typing means a type mismatch you'd catch at a glance in Java (wrong class name) can slip through silently here if two unrelated shapes happen to line up — read error messages carefully, they show the expected shape, not a type name.

## The task

You're implementing three functions over a shared `Point` type — basic 2D coordinate math using the interface below.

```ts
interface Point { x: number; y: number; }
```

**`distance(a: Point, b: Point): number`** — the straight-line (Euclidean) distance between two points.

```ts
distance({ x: 0, y: 0 }, { x: 3, y: 4 });                         // 5
distance({ x: 1, y: 1 }, { x: 1, y: 1 });                         // 0 — same point
distance({ x: 0, y: 0 }, { x: 3, y: 4 }) ===
  distance({ x: 3, y: 4 }, { x: 0, y: 0 });                       // true — symmetric
```

**`midpoint(a: Point, b: Point): Point`** — the point exactly halfway between a and b.

```ts
midpoint({ x: 0, y: 0 }, { x: 3, y: 4 });   // { x: 1.5, y: 2 }
midpoint({ x: 2, y: 2 }, { x: 2, y: 2 });   // { x: 2, y: 2 } — a point's midpoint with itself is itself
```

**`translate(p: Point, dx: number, dy: number): Point`** — a new point shifted by `(dx, dy)`. Does not mutate `p`.

```ts
translate({ x: 1, y: 2 }, 3, 4);   // { x: 4, y: 6 }
translate({ x: 5, y: 5 }, -3, -2); // { x: 2, y: 3 } — negative deltas shift backward
translate({ x: 7, y: 9 }, 0, 0);   // { x: 7, y: 9 } — zero delta leaves coordinates unchanged
```
