## What you build

You write three functions for 2D points: `distance`, `midpoint` and `translate`. TypeScript adds a compile-time type layer on top of JavaScript. The compiler rejects type errors before the code runs, and the runtime behavior stays plain JavaScript.

## Key concepts

### Annotations give a value its type

You annotate variables, parameters and return values with a type after a colon.

```ts
const name: string = "Alice";
const age: number = 30;
const active: boolean = true;
```

### An interface describes the shape of an object

A `?` after a property name makes it optional. The property then has the type `string | undefined`.

```ts
interface User {
  id: number;
  name: string;
  email?: string;
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}
```

### A type alias names any type

A `type` alias can name a union or an object shape. An `interface` and an object-shaped `type` alias are interchangeable for most uses. One difference: interfaces with the same name merge, and type aliases do not. Concept 10 covers merging.

```ts
type Point = { x: number; y: number };
type ID = string | number;
```

### TypeScript uses structural typing

An object satisfies an interface when it has the right shape. The call site needs no `implements` declaration. Unlike Java or C#, two unrelated interfaces with the same fields are interchangeable.

```ts
interface Named { name: string }
const dog = { name: "Rex", age: 3 };
// OK: dog has a name
const n: Named = dog;
```

## Watch out

- Excess property checks apply only to object literals. `const p: Point = { x: 1, y: 2, z: 3 }` is a compile error.
- Assign the same object through a variable first, and it compiles. A variable can have extra properties.
- Optional is not nullable. `email?: string` allows a missing value or `undefined`, but not `null`. Write `string | null` to allow `null`.
- Two unrelated shapes that line up pass the type check silently. Error messages show the expected shape, not a type name.

## The task

Write three functions that do 2D coordinate math. They use this interface:

```ts
interface Point { x: number; y: number; }
```

1. `distance(a: Point, b: Point): number` returns the straight-line (Euclidean) distance between `a` and `b`.
2. `midpoint(a: Point, b: Point): Point` returns the point halfway between `a` and `b`.
3. `translate(p: Point, dx: number, dy: number): Point` returns a new point shifted by `dx` and `dy`.

`translate` must not change `p`. The distance from a point to itself is 0. `distance(a, b)` equals `distance(b, a)`. The midpoint of a point with itself is that point. Negative deltas shift the point backward.

```ts
const o = { x: 0, y: 0 };
const p = { x: 3, y: 4 };
distance(o, p);   // 5
distance(o, o);   // 0
distance(p, o);   // 5
midpoint(o, p);   // { x: 1.5, y: 2 }
midpoint(o, o);   // { x: 0, y: 0 }

translate({ x: 1, y: 2 }, 3, 4);
// { x: 4, y: 6 }
translate({ x: 5, y: 5 }, -3, -2);
// { x: 2, y: 3 }
translate({ x: 7, y: 9 }, 0, 0);
// { x: 7, y: 9 }
```
