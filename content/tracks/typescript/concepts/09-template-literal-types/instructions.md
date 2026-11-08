## What you build

You write four functions whose return types are template literal types, such as `` `${E}:${A}` ``. Template literal types, from TypeScript 4.1, build string types with the backtick syntax. They catch typos in event names, CSS property keys and other string APIs at compile time. This lesson builds on **Mapped Types & Conditional Types**.

## Key concepts

### A template literal type splices types into a string pattern

The compiler accepts only strings that match the pattern.

```ts
type Greeting = `Hello, ${string}`;
// OK
const a: Greeting = "Hello, world";
// Error
const b: Greeting = "Hi, world";
```

### A union inside the pattern gives every combination

TypeScript expands each union member into its own string type.

```ts
type Side =
  "top" | "bottom" | "left" | "right";
type Padding = `padding-${Side}`;
// "padding-top" | "padding-bottom"
// | "padding-left" | "padding-right"
```

### Event names are a common use

Two unions of three members each give nine event names.

```ts
type Entity = "user" | "post" | "comment";
type Action =
  "created" | "updated" | "deleted";
type EventName = `${Entity}:${Action}`;
// "user:created" | "user:updated" | ...
```

### The compiler has intrinsic string types

`Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize` transform string literal types.

```ts
type U = Uppercase<"hello">;     // "HELLO"
type L = Lowercase<"WORLD">;     // "world"
type C = Capitalize<"alice">;    // "Alice"
type UC = Uncapitalize<"Alice">; // "alice"
```

### Template literal types exist only at compile time

At runtime, a template literal is plain string interpolation. JavaScript has nothing for string manipulation at the type level.

## Watch out

- `` `${number}` `` matches any string that looks like a number, such as `"3"`, `"3.14"` or `"-1"`.
- A non-literal type in the pattern is a shape constraint, not one fixed value.
- Unions in a pattern multiply. Two unions of 3 give 9 members, and three unions of 4 give 64.
- Large unions inside template literals can slow the type checker.
- `Capitalize` and the other intrinsic types work only on string literal types.
- `.toUpperCase()` returns `string`. You need an `as` assertion to return `Uppercase<S>`.

## The task

Write four functions. Their signatures use template literal types to enforce string shapes, and the tests check runtime values. The stub declares these types:

```ts
type CssProp =
  "margin" | "padding" | "border";
type Side =
  "top" | "bottom" | "left" | "right";
type CssProperty = `${CssProp}-${Side}`;
type Entity = "user" | "post" | "comment";
type EventAction =
  "created" | "updated" | "deleted";
```

`CssProperty` has 12 members, such as `"margin-top"` and `"border-left"`.

1. `formatEvent<E extends Entity, A extends EventAction>(entity: E, action: A): `` `${E}:${A}` `` joins its arguments with a colon.
2. `toCssProperty<P extends CssProp, S extends Side>(prop: P, side: S): `` `${P}-${S}` `` joins its arguments with a hyphen.
3. `capitalize<S extends string>(s: S): Capitalize<S>` uppercases the first character and keeps the rest.
4. `toEventKey<S extends string>(s: S): Uppercase<S>` uppercases every character.

An empty string stays empty in `capitalize` and `toEventKey`. A capitalized word stays the same.

```ts
formatEvent("user", "created");
// "user:created"
formatEvent("post", "deleted");
// "post:deleted"
formatEvent("comment", "updated");
// "comment:updated"

toCssProperty("margin", "top");
// "margin-top"
toCssProperty("padding", "left");
// "padding-left"
toCssProperty("border", "bottom");
// "border-bottom"

capitalize("hello");  // "Hello"
capitalize("World");  // "World"
capitalize("");       // ""
capitalize("a");      // "A"

toEventKey("hello");      // "HELLO"
toEventKey("helloWorld"); // "HELLOWORLD"
toEventKey("");           // ""
```
