# Template Literal Types

## What you'll learn

TypeScript 4.1 added template literal types — the same backtick syntax you use at runtime, but operating entirely at the type level. They let you construct string types programmatically, catching typos in event names, CSS property keys, and other string-based APIs at compile time.

## Key concepts

**Basic template literal types** splice types into string patterns:

```ts
type Greeting = `Hello, ${string}`;
const a: Greeting = "Hello, world";   // ok
const b: Greeting = "Hi, world";      // error
```

**Union distribution** — when a union appears inside a template literal, TypeScript generates every combination:

```ts
type Side = "top" | "bottom" | "left" | "right";
type Padding = `padding-${Side}`;
// "padding-top" | "padding-bottom" | "padding-left" | "padding-right"
```

**Event name patterns** are a common use case:

```ts
type Entity = "user" | "post" | "comment";
type Action = "created" | "updated" | "deleted";
type EventName = `${Entity}:${Action}`;
// "user:created" | "user:updated" | ... (9 members)
```

**Intrinsic string manipulation types** are built into the compiler:

```ts
type U = Uppercase<"hello">;     // "HELLO"
type L = Lowercase<"WORLD">;     // "world"
type C = Capitalize<"alice">;    // "Alice"
type UC = Uncapitalize<"Alice">; // "alice"
```

**vs JavaScript:** Template literals at runtime are just string interpolation. Template literal *types* exist only at compile time — no runtime cost. JavaScript has no equivalent for type-level string manipulation.

## The task

Implement these functions. Their signatures use template literal types to enforce string shapes.

- `type CssProperty = \`${CssProp}-${Side}\`` — define this type using the provided `CssProp` and `Side` unions
- `formatEvent<E extends Entity, A extends EventAction>(entity: E, action: A): \`${E}:${A}\`` — returns `"user:created"` style strings
- `toCssProperty<P extends CssProp, S extends Side>(prop: P, side: S): \`${P}-${S}\`` — returns `"margin-top"` style strings
- `capitalize<S extends string>(s: S): Capitalize<S>` — runtime implementation of `Capitalize`
- `toEventKey<S extends string>(s: S): Uppercase<S>` — uppercases a string (runtime implementation of `Uppercase`)
