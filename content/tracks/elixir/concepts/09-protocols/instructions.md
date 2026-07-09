# Protocols

## What you'll learn

Building on structs from concept 04: protocols are Elixir's mechanism for polymorphism. A protocol defines a contract (a set of functions) and you implement that contract separately for any data type — including built-in types and types defined in third-party libraries you don't control. This lesson also covers a real footgun: naming a protocol function after a `Kernel` built-in.

## Key concepts

**Defining a protocol:**

```elixir
defprotocol Describable do
  @doc "Returns a human-readable description of a value."
  def describe(value)
end
```

This defines `Describable.describe/1` but provides no implementation. The protocol is now available as a dispatch target.

**Implementing a protocol:**

```elixir
defimpl Describable, for: Integer do
  def describe(n), do: "integer #{n}"
end

defimpl Describable, for: BitString do
  def describe(s), do: "string \"#{s}\""
end

Describable.describe(42)       # => "integer 42"
Describable.describe("hello")  # => "string \"hello\""
```

`for:` accepts any type: `Integer`, `Float`, `BitString`, `List`, `Map`, `Atom`, `Tuple`, `Function`, `PID`, `Any`, or a struct name.

**Implementing for your own struct:**

```elixir
defmodule Circle do
  defstruct radius: 0
end

defimpl Describable, for: Circle do
  def describe(%Circle{radius: r}), do: "circle with radius #{r}"
end
```

**`@derive` shortcut** lets a struct opt into a protocol if the protocol defines a fallback using `Any`:

```elixir
defprotocol Printable do
  @fallback_to_any true
  def print(value)
end

defimpl Printable, for: Any do
  def print(v), do: inspect(v)
end

defmodule Point do
  @derive Printable
  defstruct x: 0, y: 0
end
```

**Protocols vs Behaviours:**

- **Protocol**: polymorphism across data types. You dispatch on the *data*. No process required.
- **Behaviour**: a contract for module implementations — primarily used for OTP callbacks (`GenServer`, `Supervisor`). You dispatch on the *module*, not data.

Use a protocol when different *types* need to respond to the same operation. Use a behaviour when different *modules* need to plug into the same framework.

## vs other languages

| | Elixir Protocol | Go Interface | Haskell Typeclass | Java Interface |
|---|---|---|---|---|
| Dispatch on | Data type | Structural (implicit) | Type at compile time | Object type |
| Open extensibility | Yes — add impls anywhere | Yes — implicit | Yes — orphan instances | No — must implement at definition |
| Retroactive impl | Yes | Yes (implicit) | Yes (with caveats) | No |
| Performance | Runtime dispatch (fast) | Interface table (fast) | Dictionary-passing | vtable |

The big advantage over Go and Java: you can implement a protocol for a type you don't own. You can add `Describable` to `Integer` without touching the Integer source. In Java you'd need a wrapper class or a utility method.

## Watch out

- **Every module — including a `defimpl` block — auto-imports `Kernel`.** `Kernel` defines `byte_size/1`, `bit_size/1`, `map_size/1`, `tuple_size/1`, and `length/1` as regular functions. If your protocol declares a function with one of these names, every `defimpl` block gets a compile error: `imported Kernel.byte_size/1 conflicts with local function`. The fix is to pick a protocol function name that doesn't shadow a `Kernel` built-in (this lesson uses `byte_length/1` for exactly this reason) — or, if you must keep the name, add `import Kernel, except: [byte_size: 1]` to the `defimpl` block.
- Protocols dispatch on the *concrete* type at runtime — `defimpl ..., for: Integer` only matches integers, not floats. There's no numeric coercion the way `+` has for `Integer`/`Float`.
- Forgetting a `defimpl` for a type you pass in raises `Protocol.UndefinedError` at the call site, not at compile time. Protocols are open, so the compiler can't check exhaustiveness.

## The task

Define a `Serializable` protocol and implement it for several built-in types, mimicking a lightweight logging/serialization layer.

**Protocol:**
- `Serializable.serialize(value)` — returns a string representation suitable for logging or storage.
- `Serializable.byte_length(value)` — returns the byte size of the serialized string form.

**Implementations to write:**

1. For `Integer`: serialize as `"int:#{n}"`.
   ```elixir
   Serializable.serialize(42)   # => "int:42"
   Serializable.serialize(-7)   # => "int:-7"
   ```
2. For `Float`: serialize as `"float:#{n}"`, using `:erlang.float_to_binary(n, decimals: 2)` for consistent two-decimal formatting.
   ```elixir
   Serializable.serialize(3.14)  # => "float:3.14"
   Serializable.serialize(1.0)   # => "float:1.00"
   ```
3. For `BitString` (strings): serialize as `"str:#{s}"`.
   ```elixir
   Serializable.serialize("hello")  # => "str:hello"
   Serializable.serialize("")       # => "str:"
   ```
4. For `List`: serialize as `"list:[#{items}]"`, where `items` is each element's own serialized form, comma-joined.
   ```elixir
   Serializable.serialize([1, 2, 3])   # => "list:[int:1,int:2,int:3]"
   Serializable.serialize([])          # => "list:[]"
   Serializable.serialize([1, "a"])    # => "list:[int:1,str:a]"  — mixed types both dispatch correctly
   ```

**`byte_length/1`** — for every type above, derive the result from `byte_size(serialize(value))` (the `Kernel` built-in, called on the serialized string — not the protocol function of the same near-name).

```elixir
Serializable.byte_length(42)          # => byte_size("int:42")        => 6
Serializable.byte_length("hello")     # => byte_size("str:hello")     => 9
Serializable.byte_length([1, 2])      # => byte_size("list:[int:1,int:2]")
```
