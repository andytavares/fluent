## What you build

You build a singly linked list from nodes that `std::unique_ptr` owns. A smart pointer deletes its object when the pointer goes out of scope, so you write no `delete`. This lesson builds on **STL Containers**.

## Key concepts

### A smart pointer ties a lifetime to a scope

A smart pointer wraps a raw pointer. When the smart pointer goes out of scope, it deletes the object it owns. This is RAII (Resource Acquisition Is Initialization); the RAII lesson covers it in full.

```cpp
{
    auto p = std::make_unique<int>(42);
}
// The int is deleted here
```

### `std::unique_ptr` is the only owner

When a `unique_ptr` goes out of scope, it deletes the object. You cannot copy it. You can only move it.

```cpp
#include <memory>

auto p = std::make_unique<int>(42);
*p;        // 42
// Raw pointer: use rarely, never delete
p.get();
// Deletes the object, sets p to null
p.reset();
```

### `std::shared_ptr` counts its owners

Many owners share the object through a reference count. The last `shared_ptr` to go away deletes the object.

```cpp
auto s1 = std::make_shared<std::string>(
    "hello");
auto s2 = s1;    // ref count = 2
s1.use_count();  // 2
// When s1 and s2 both go away,
// the string is deleted
```

### `std::weak_ptr` observes without owning

A `weak_ptr` watches a `shared_ptr` but does not add to the count. Use it to break reference cycles. `lock()` returns a `shared_ptr` if the object is still alive.

```cpp
std::weak_ptr<T> weak = shared;
if (auto locked = weak.lock()) {
    // The object is alive: use *locked
}
```

### Create objects with `make_unique` and `make_shared`

Do not use `new`. The factories leave no bare `new` and `delete` to mismatch. They are exception-safe if a constructor throws in the middle of an expression. `make_shared` also does one allocation instead of two.

```cpp
// Do this
auto a = std::make_unique<Node>(1);
// Not this
std::unique_ptr<Node> b(new Node(1));
```

### The type states who owns the object

- `unique_ptr` is the default: one clear owner.
- `shared_ptr` is for many owners that share one lifetime.
- A raw pointer or a reference only observes. It never owns, and it must not outlive the owner.

Java, Go, Python and Ruby use a garbage collector, so you never declare ownership. In C++, `unique_ptr<Node>` states "this owns the Node." You get deterministic destruction with zero overhead and no GC pauses, but you must design ownership.

```cpp
// The caller owns the result
std::unique_ptr<Node> make();
// print only observes the node
void print(const Node* node);
```

## Watch out

- Copying a `unique_ptr` is a compile error. `std::unique_ptr<Node> a = b;` does not compile.
- `std::move(b)` transfers ownership. After the move, `b` is empty (`nullptr`).
- `.get()` returns a raw pointer that does not own. Never `delete` it.
- The raw pointer from `.get()` dangles once you destroy, reset or reassign the smart pointer. Do not store it.
- `std::shared_ptr<Node> p(rawPtr); delete rawPtr;` frees the object twice. Let the smart pointer own the memory alone.
- Two objects that hold a `shared_ptr` to each other never reach a count of zero. They leak.
- Break such a cycle with a `weak_ptr` on one side.

## The task

Build a singly linked list in `stub.cpp`. Each node owns the rest of the list through `next`. The stub gives the node type:

```cpp
struct Node {
    int value;
    std::unique_ptr<Node> next;
    Node(int v) : value(v) {}
};
```

Destroying the head `unique_ptr` destroys the whole chain, node by node.

1. `std::unique_ptr<Node> build_list(const std::vector<int>& values)` builds a list from `values` in order.
2. The first element of `values` becomes the head. `build_list` returns a `unique_ptr` to the head.
3. For an empty `values`, `build_list` returns `nullptr`.
4. `int list_sum(const Node* head)` returns the sum of all node values, from `head` to the end.
5. `int list_length(const Node* head)` returns the number of nodes.

`list_sum(nullptr)` and `list_length(nullptr)` both return `0`.

```cpp
auto empty = build_list({});
empty == nullptr;      // true
list_sum(nullptr);     // 0
list_length(nullptr);  // 0

auto one = build_list({7});
list_length(one.get());  // 1
list_sum(one.get());     // 7

auto head = build_list({1, 2, 3, 4, 5});
list_length(head.get());  // 5
list_sum(head.get());     // 15
head->value;              // 1
head->next->value;        // 2
head->next->next->value;  // 3
// At the end of scope, the chain is freed
```
