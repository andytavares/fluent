## What you build

You write two type guards, `isString` and `isNumber`, and two functions that use them. A type guard is an expression, often a function, that narrows a union type inside a conditional branch. This lesson builds on **Union Types & Narrowing**.

## Key concepts

### `typeof` narrows primitive types

Inside the `if`, TypeScript treats `value` as a `string`. After it, `value` is a `number`.

```ts
function format(
  value: string | number,
): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}
```

### `instanceof` narrows class instances

It checks the prototype chain at runtime.

```ts
function handleError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
```

### A custom guard returns `value is T`

When the function returns `true`, TypeScript narrows the argument to `T` in that branch. Java needs an explicit cast after `instanceof`, but TypeScript narrows with no cast.

```ts
function isString(
  value: unknown,
): value is string {
  return typeof value === "string";
}

if (isString(input)) {
  // OK: input is a string here
  input.toUpperCase();
}
```

### `never` checks that the cases cover every member

In the `default` case, the value has type `never` when the cases cover every member. A missing case makes the assignment a compile error.

```ts
type Color = "red" | "green" | "blue";

function hex(c: Color): string {
  switch (c) {
    case "red": return "#ff0000";
    case "green": return "#00ff00";
    case "blue": return "#0000ff";
    default:
      // Compile error if a case is missing
      const _: never = c;
      return _;
  }
}
```

## Watch out

- The compiler does not check a custom guard. It trusts the `value is T` return type.
- A guard that always returns `true` compiles and lies about every input.
- `typeof null` is `"object"`. A guard that checks only for `"object"` accepts `null`.
- `typeof NaN` is `"number"`. A guard based only on `typeof` accepts `NaN`. This task's `isNumber` rejects it.

## The task

Write two type guards and two functions that use them.

1. `isString(value: unknown): value is string` returns `true` only for strings.
2. `isNumber(value: unknown): value is number` returns `true` only for numbers that are not `NaN`.
3. `parseNumber(value: unknown): number` returns a number unchanged when `isNumber` accepts it.
4. For a string that parses to a valid number, `parseNumber` returns the parsed number.
5. For any other value, `parseNumber` throws a `TypeError`.
6. `formatValue(value: string | number | boolean | null | undefined): string` formats each type differently.

`formatValue` rules:

- A string comes back in double quotes: `hi` gives `"hi"`.
- A number comes back as its decimal string.
- A boolean gives `"true"` or `"false"`.
- `null` gives `"null"`, and `undefined` gives `"undefined"`.

```ts
isString("hello");    // true
isString(42);         // false
isString(null);       // false
isString(undefined);  // false

isNumber(42);         // true
isNumber(0);          // true
isNumber(NaN);        // false
isNumber("42");       // false
isNumber(null);       // false

parseNumber(42);      // 42
parseNumber("99");    // 99
parseNumber("3.14");  // 3.14
parseNumber({});      // throws TypeError
parseNumber("abc");   // throws TypeError

formatValue("hi");    // '"hi"'
formatValue(42);      // "42"
formatValue(true);    // "true"
formatValue(false);   // "false"
formatValue(null);    // "null"
formatValue(undefined); // "undefined"
```
