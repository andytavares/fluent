# Template Literal Types

## What you'll learn

Lesson 8 showed the type system branching and iterating; template literal types (TypeScript 4.1+) add string *construction* to that toolkit — the same backtick syntax you use at runtime, but operating entirely at the type level. They let you build string types programmatically, catching typos in event names, CSS property keys, and other string-based APIs at compile time instead of at runtime.

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

## Watch out

- Interpolating a non-literal type widens the whole pattern: `` `${number}` `` as a type matches *any* string that looks like a number ("3", "3.14", "-1"), not one specific literal — it's a shape constraint, not a fixed value.
- Union distribution inside a template literal is combinatorial: crossing two unions of size 3 produces 9 members, three unions of size 4 produce 64. Large unions inside template literals can slow the type checker noticeably.
- `Capitalize`/`Uppercase`/etc. only operate on **string literal types**. Given a plain `string`-typed value at runtime, calling `.toUpperCase()` still works, but you need an `as` assertion to tell the compiler the *type-level* relationship holds (see the exemplar) — the runtime call and the type-level guarantee are two separate things.

## The task

Implement these functions. Their signatures use template literal types to enforce string shapes at compile time; tests check the runtime string values.

```ts
type CssProp = "margin" | "padding" | "border";
type Side = "top" | "bottom" | "left" | "right";
type Entity = "user" | "post" | "comment";
type EventAction = "created" | "updated" | "deleted";
```

**`type CssProperty = \`${CssProp}-${Side}\`​`** — define this type using the unions above (e.g. `"margin-top"`, `"border-left"` — 12 members total).

**`formatEvent<E extends Entity, A extends EventAction>(entity: E, action: A): \`${E}:${A}\`​`** — joins entity and action with a colon.

```ts
formatEvent("user", "created");     // "user:created"
formatEvent("post", "deleted");     // "post:deleted"
formatEvent("comment", "updated"); // "comment:updated"
```

**`toCssProperty<P extends CssProp, S extends Side>(prop: P, side: S): \`${P}-${S}\`​`** — joins prop and side with a hyphen.

```ts
toCssProperty("margin", "top");     // "margin-top"
toCssProperty("padding", "left");   // "padding-left"
toCssProperty("border", "bottom");  // "border-bottom"
```

**`capitalize<S extends string>(s: S): Capitalize<S>`** — runtime implementation of the intrinsic `Capitalize` type: uppercases the first character, leaves the rest unchanged.

```ts
capitalize("hello");  // "Hello"
capitalize("World");  // "World" — already capitalized
capitalize("");       // ""      — empty string stays empty
capitalize("a");      // "A"
```

**`toEventKey<S extends string>(s: S): Uppercase<S>`** — runtime implementation of the intrinsic `Uppercase` type: uppercases every character.

```ts
toEventKey("hello");       // "HELLO"
toEventKey("helloWorld");  // "HELLOWORLD"
toEventKey("");            // ""
```
