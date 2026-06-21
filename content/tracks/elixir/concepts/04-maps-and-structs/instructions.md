# Maps & Structs

## What you'll learn

Elixir's `Map` is a hash map with immutable semantics — every "update" returns a new map. Structs layer a named schema with compile-time key checking on top of maps. Together they cover the full range from flexible key-value storage to typed domain models.

## Key concepts

**Creating and accessing maps:**

```elixir
user = %{name: "Alice", age: 30}

user.name          # => "Alice"   (dot access — raises KeyError if missing)
user[:name]        # => "Alice"   (bracket access — returns nil if missing)
Map.get(user, :name, "default")  # => "Alice"
Map.fetch(user, :age)            # => {:ok, 30}
Map.fetch(user, :email)          # => :error
```

Atom keys (`:name`) support dot access. String keys (`"name"`) do not.

**Updating maps** — always returns a new map:

```elixir
updated = %{user | age: 31}            # update syntax — key must exist
with_email = Map.put(user, :email, "alice@example.com")  # add new key
without_age = Map.delete(user, :age)
```

The `%{map | key: val}` syntax is a compile-time assertion that the key already exists in the map. Typos become compile errors.

**Pattern matching on maps:**

```elixir
%{name: name} = user          # binds name = "Alice"; other keys are ignored
%{role: "admin"} = user       # MatchError unless role is "admin"
```

Map patterns match a subset — you don't have to list every key.

**Structs:**

```elixir
defmodule User do
  defstruct name: nil, age: 0, role: :user
end

alice = %User{name: "Alice", age: 30}
alice.name        # => "Alice"
alice.email       # => compile error — unknown key

%User{name: name} = alice   # pattern matching works the same way
```

A struct is a map with a `__struct__` key set to the module name. It enforces that only declared keys are used, at compile time. You cannot add ad-hoc keys after the fact.

**Map vs struct pattern matching:**

```elixir
def greet(%User{name: name}), do: "Hello, #{name}"
def greet(%{name: name}),     do: "Hello, #{name}"  # matches any map with :name
```

The struct version is stricter — it only matches `%User{}` structs.

## vs other languages

| | Elixir | Python | JavaScript | Go |
|---|---|---|---|---|
| Dynamic map | `%{}` | `dict` | `{}` | `map[K]V` |
| Typed struct | `defstruct` in module | `dataclass` / `TypedDict` | No native | `struct` |
| Update semantics | Returns new map | Mutates in place | Mutates in place | Mutates in place |
| Missing key | `nil` (bracket) / error (dot) | `KeyError` / `.get()` | `undefined` | zero value / `ok` idiom |

Coming from Go: Elixir structs are closer to Go structs in that unknown fields are a compile error, but they live inside a module rather than being a standalone type.

Coming from Python/JS: the immutable update `%{map | key: val}` looks like mutation but creates a new map. The original is unchanged.

## The task

Implement these functions in the `Inventory` module:

```elixir
defmodule Item do
  defstruct name: "", price: 0.0, quantity: 0
end
```

1. `new_item(name, price, quantity)` — returns a `%Item{}` struct.
2. `total_value(item)` — returns `price * quantity`.
3. `restock(item, amount)` — returns a new `%Item{}` with `quantity` increased by `amount`.
4. `apply_discount(item, percent)` — returns a new `%Item{}` with `price` reduced by `percent` percent (e.g., 10 means 10% off).
5. `find_by_name(items, name)` — given a list of `%Item{}` structs, returns the first one with a matching name, or `nil` if not found.
