## What you build

You write an `Inventory` module that creates, reads and updates `%Item{}` structs. A map is an immutable hash map, and a struct adds a fixed set of keys to a map. This lesson builds on **Lists & Recursion**.

## Key concepts

### A map stores keys and values

Dot access raises `KeyError` for a missing key. Bracket access returns `nil`. Only atom keys such as `:name` support dot access. String keys such as `"name"` do not.

```elixir
user = %{name: "Alice", age: 30}

user.name     # => "Alice"
user[:name]   # => "Alice"
user[:email]  # => nil
Map.get(user, :name, "default")
# => "Alice"
Map.fetch(user, :age)    # => {:ok, 30}
Map.fetch(user, :email)  # => :error
```

### An update returns a new map

No map function changes its argument. In Python, JavaScript and Go, a map update changes the map in place.

```elixir
# The key must exist
updated = %{user | age: 31}
# Adds a new key
with_email =
  Map.put(user, :email, "a@example.com")
without_age = Map.delete(user, :age)
```

### `%{map | key: val}` needs an existing key

The update syntax raises `KeyError` when the key is not in the map. Use it to catch a misspelled key. Use `Map.put/3` to add a key.

### A map pattern matches a subset

A map pattern lists only the keys you need. The map can have other keys.

```elixir
# Binds name = "Alice"
%{name: name} = user
# MatchError unless role is "admin"
%{role: "admin"} = user
```

### A struct is a map with fixed keys

`defstruct` declares the keys and their defaults. A struct is a map with a `__struct__` key set to the module name. A struct with an unknown key fails at compile time.

```elixir
defmodule User do
  defstruct name: nil, age: 0, role: :user
end

alice = %User{name: "Alice", age: 30}
alice.name  # => "Alice"
# Compile error: unknown key
%User{email: "a@example.com"}

# Pattern matching works the same way
%User{name: name} = alice
```

### A struct pattern is stricter

A `%User{}` pattern matches only `User` structs. A `%{}` pattern matches any map with the listed keys.

```elixir
def greet(%User{name: name}),
  do: "Hello, #{name}"

# Matches any map with :name
def greet(%{name: name}),
  do: "Hello, #{name}"
```

## Watch out

- `%{item | quantity: n}` raises `KeyError` when `quantity` is not a key. It updates; it does not insert.
- To add a key, use `Map.put/3` or set it when you build the struct.
- `restock/2` and `apply_discount/2` return a new struct. The original variable keeps its old value.
- Rebind the return value to see the change.
- `Enum.find/2` returns `nil` when nothing matches, not an `{:error, ...}` tuple.

## The task

Write five functions in the `Inventory` module. They work on this struct:

```elixir
defmodule Item do
  defstruct name: "", price: 0.0,
            quantity: 0
end
```

1. `new_item(name, price, quantity)` returns an `%Item{}` with these three fields.
2. `total_value(item)` returns `item.price * item.quantity`.
3. `restock(item, amount)` returns a new `%Item{}` with `quantity` increased by `amount`.
4. `apply_discount(item, percent)` returns a new `%Item{}` with `price` reduced by `percent` percent.
5. `find_by_name(items, name)` returns the first `%Item{}` in `items` with that `name`.

`restock/2` and `apply_discount/2` keep all other fields. They do not change the original `item`. A `percent` of `10` means 10% off, and `0` means no change. `find_by_name/2` returns `nil` when no item matches, or when `items` is empty.

```elixir
apple =
  Inventory.new_item("Apple", 1.50, 100)
# => %Item{name: "Apple", price: 1.5,
#          quantity: 100}
banana =
  Inventory.new_item("Banana", 0.75, 200)

Inventory.total_value(apple)   # => 150.0
Inventory.total_value(banana)  # => 150.0
x = Inventory.new_item("X", 5.0, 0)
Inventory.total_value(x)       # => 0.0

Inventory.restock(apple, 50).quantity
# => 150
apple.quantity                 # => 100

Inventory.apply_discount(apple, 10).price
# => 1.35 (within 0.0001)
Inventory.apply_discount(apple, 0).price
# => 1.5

Inventory.find_by_name([apple, banana],
  "Banana")
# => %Item{name: "Banana", ...}
Inventory.find_by_name([apple, banana],
  "Orange")
# => nil
Inventory.find_by_name([], "Apple")
# => nil
```
