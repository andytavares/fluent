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

## Watch out

- `%{item | quantity: new_qty}` raises `KeyError` if `quantity` isn't already a key on `item` — it's an update, not an insert. Use `Map.put/3` (or set the field in `%Item{}` at construction) for new keys.
- `restock`/`apply_discount`/etc. all **return a new struct** — they never mutate the argument. If a test still sees the old value on the original variable after calling one of these, that's expected: rebind the return value to see the change.
- `Enum.find/2` (used for `find_by_name`) returns `nil`, not `{:error, ...}`, when nothing matches — Elixir's convention here is a plain nullable return, not a tagged tuple.

## The task

Implement these functions in the `Inventory` module, which manages `%Item{}` structs:

```elixir
defmodule Item do
  defstruct name: "", price: 0.0, quantity: 0
end
```

**`new_item(name, price, quantity)`** — returns a populated `%Item{}` struct.

```elixir
Inventory.new_item("Apple", 1.50, 100)
# => %Item{name: "Apple", price: 1.50, quantity: 100}
```

**`total_value(item)`** — returns `item.price * item.quantity`.

```elixir
apple = Inventory.new_item("Apple", 1.50, 100)
Inventory.total_value(apple)  # => 150.0
Inventory.total_value(Inventory.new_item("X", 5.0, 0))  # => 0.0
```

**`restock(item, amount)`** — returns a **new** `%Item{}` with `quantity` increased by `amount`; all other fields unchanged. The original `item` is untouched.

```elixir
Inventory.restock(apple, 50).quantity  # => 150
apple.quantity                          # => 100  — original unchanged
```

**`apply_discount(item, percent)`** — returns a new `%Item{}` with `price` reduced by `percent` percent (e.g. `10` means 10% off).

```elixir
Inventory.apply_discount(apple, 10).price  # => 1.35
Inventory.apply_discount(apple, 0).price   # => 1.50  — no change
```

**`find_by_name(items, name)`** — given a list of `%Item{}` structs, returns the first one whose `name` matches, or `nil` if none do.

```elixir
banana = Inventory.new_item("Banana", 0.75, 200)
Inventory.find_by_name([apple, banana], "Banana")  # => %Item{name: "Banana", ...}
Inventory.find_by_name([apple, banana], "Orange")  # => nil
Inventory.find_by_name([], "Apple")                # => nil
```
