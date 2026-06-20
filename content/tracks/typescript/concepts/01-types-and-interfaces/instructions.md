# Types & Interfaces

## What you'll learn

TypeScript adds a compile-time type layer on top of JavaScript. Annotate variables, parameters, and return values with types. The compiler rejects violations before your code ever runs.

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
  email?: string;  // optional property
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}
```

**Type aliases** name any type, including unions:
```ts
type Point = { x: number; y: number };
type ID = string | number;
```

**vs other languages:** TypeScript uses *structural* typing, not nominal. An object satisfies an interface if it has the right shape — no `implements` declaration is required at the call site. This is sometimes called "duck typing at compile time."

## The task

Given this interface:
```ts
interface Point { x: number; y: number; }
```

Implement:
- `distance(a: Point, b: Point): number` — Euclidean distance between two points
- `midpoint(a: Point, b: Point): Point` — the point exactly halfway between a and b
- `translate(p: Point, dx: number, dy: number): Point` — return a new point shifted by (dx, dy)
