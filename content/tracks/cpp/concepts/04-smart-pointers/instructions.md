# Smart Pointers

## What you'll learn

Smart pointers are wrappers around raw pointers that tie an object's lifetime to a scope — RAII (Resource Acquisition Is Initialization), covered in full in lesson 10. When a smart pointer goes out of scope, the object it owns is automatically deleted. No `delete`, no leaks, no manual bookkeeping.

## Key concepts

**`std::unique_ptr<T>`** — sole owner. When it goes out of scope, the object is deleted. Cannot be copied, only moved.
```cpp
#include <memory>

auto p = std::make_unique<int>(42);
*p;               // 42
p.get();          // raw pointer (use rarely, never delete it yourself)
p.reset();        // explicit delete + set to null
```

**`std::shared_ptr<T>`** — shared ownership via reference counting. The object is deleted when the last `shared_ptr` to it is destroyed.
```cpp
auto s1 = std::make_shared<std::string>("hello");
auto s2 = s1;  // ref count = 2
s1.use_count(); // 2
// both s1 and s2 destroyed → object deleted
```

**`std::weak_ptr<T>`** — non-owning observer of a `shared_ptr`. Use it to break reference cycles (two objects each holding a `shared_ptr` to the other would otherwise never reach a ref count of zero).
```cpp
std::weak_ptr<T> weak = shared;
if (auto locked = weak.lock()) {  // upgrade to shared_ptr if still alive
    // use *locked
}
```

**Factory rule:** always use `std::make_unique` / `std::make_shared` instead of `new`. It's safer (no bare `new`/`delete` to mismatch, exception-safe if a constructor throws mid-expression) and, for `shared_ptr`, faster (one allocation instead of two).

**Ownership heuristic:**
- `unique_ptr` — default choice; a single, clear owner.
- `shared_ptr` — multiple owners genuinely sharing a lifetime.
- raw pointer or reference — observing only, never owning, never outliving the owner.

**vs other languages:** Java/Go/Python/Ruby use a garbage collector, so ownership is never something you declare — any reachable object stays alive. C++ ownership is explicit in the type system: a `unique_ptr<Node>` *is* the statement "this function/object owns this Node." The payoff is zero-overhead, deterministic destruction and no GC pauses; the cost is that you have to design ownership on purpose.

## Watch out

- **A `unique_ptr` cannot be copied — only moved.** `std::unique_ptr<Node> a = b;` where `b` is also a `unique_ptr` is a compile error, not a runtime one. Use `std::move(b)` to transfer ownership explicitly, and understand that `b` is empty (`nullptr`) afterward.
- **`.get()` returns a non-owning raw pointer.** Never `delete` it yourself and never store it somewhere that outlives the smart pointer — the raw pointer becomes dangling the instant the `unique_ptr`/`shared_ptr` is destroyed, reset, or reassigned.
- **Mixing `new`/`delete` with smart pointers is a double-free waiting to happen.** `std::shared_ptr<Node> p(rawPtr); delete rawPtr;` frees the object twice (once explicitly, once when `p` is destroyed). Let the smart pointer own the memory exclusively.
- **`shared_ptr` cycles leak.** If A holds a `shared_ptr` to B and B holds a `shared_ptr` back to A, neither ref count ever reaches zero, even if nothing else references either object. Break cycles with `weak_ptr` on one side.

## The task

Implement a singly-linked list built from `unique_ptr`-owned nodes, in `stub.cpp`. The node type is given:

```cpp
struct Node {
    int value;
    std::unique_ptr<Node> next;
    Node(int v) : value(v) {}
};
```

Each node owns the rest of the list via `next` — when the head `unique_ptr` is destroyed, the whole chain is destroyed automatically, node by node.

**`std::unique_ptr<Node> build_list(const std::vector<int>& values)`** — builds a list from `values` in order (the first element becomes the head) and returns a `unique_ptr` to the head. For an empty `values`, returns `nullptr`.

**`int list_sum(const Node* head)`** — returns the sum of every node's `value`, walking from `head` to the end. `list_sum(nullptr)` returns `0`.

**`int list_length(const Node* head)`** — returns the number of nodes. `list_length(nullptr)` returns `0`.

```cpp
auto empty = build_list({});
empty == nullptr;          // true
list_sum(nullptr);         // 0
list_length(nullptr);      // 0

auto single = build_list({7});
list_length(single.get()); // 1
list_sum(single.get());    // 7

auto head = build_list({1, 2, 3, 4, 5});
list_length(head.get());   // 5
list_sum(head.get());      // 15
head->value;                // 1
head->next->value;          // 2
head->next->next->value;    // 3
// head goes out of scope here — the entire chain is freed automatically
```
