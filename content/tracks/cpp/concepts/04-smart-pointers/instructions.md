# Smart Pointers

## What you'll learn

Smart pointers are wrappers around raw pointers that tie an object's lifetime to a scope (RAII — Resource Acquisition Is Initialization). When a smart pointer goes out of scope, the object is automatically deleted. No `delete`, no leaks.

## Key concepts

**`std::unique_ptr<T>`** — sole owner. When it goes out of scope, the object is deleted. Cannot be copied, only moved.
```cpp
#include <memory>

auto p = std::make_unique<int>(42);
*p;               // 42
p.get();          // raw pointer (use rarely)
p.reset();        // explicit delete + set to null
```

**`std::shared_ptr<T>`** — shared ownership via reference counting. The object is deleted when the last `shared_ptr` to it is destroyed.
```cpp
auto s1 = std::make_shared<std::string>("hello");
auto s2 = s1;  // ref count = 2
s1.use_count(); // 2
// both s1 and s2 destroyed → object deleted
```

**`std::weak_ptr<T>`** — non-owning observer of a `shared_ptr`. Use it to break reference cycles.
```cpp
std::weak_ptr<T> weak = shared;
if (auto locked = weak.lock()) {  // upgrade to shared_ptr if still alive
    // use *locked
}
```

**Factory rule:** Always use `std::make_unique` / `std::make_shared` instead of `new`. It is safer (no raw `new`, exception-safe) and often faster for `shared_ptr`.

**Ownership heuristic:**
- `unique_ptr` — default choice; clear single owner
- `shared_ptr` — multiple owners sharing a lifetime
- raw pointer — observing only (never owning)

**vs other languages:** Java/Go/Python use a garbage collector so you never think about ownership. C++ ownership must be explicit. The upside: zero-overhead, deterministic destruction, no GC pauses.

## The task

Implement a `Node` struct and a linked list builder using smart pointers:

```cpp
struct Node {
    int value;
    std::unique_ptr<Node> next;
    Node(int v) : value(v) {}
};
```

- `std::unique_ptr<Node> build_list(const std::vector<int>& values)` — create a singly-linked list from `values` (first value is the head), return a `unique_ptr` to the head (return `nullptr` for empty input)
- `int list_sum(const Node* head)` — return the sum of all values in the list
- `int list_length(const Node* head)` — return the number of nodes
