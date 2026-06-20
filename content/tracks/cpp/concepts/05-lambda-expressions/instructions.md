# Lambda Expressions

## What you'll learn

A lambda is an anonymous function defined inline. Lambdas in C++ are objects — they can be stored in `std::function`, passed to algorithms, and capture variables from the surrounding scope.

## Key concepts

**Basic lambda syntax:**
```cpp
auto double_it = [](int x) { return x * 2; };
double_it(5);  // 10
```

**Capture clause** controls which outer variables the lambda can use:
```cpp
int offset = 10;
auto add_offset = [offset](int x) { return x + offset; };  // capture by value
auto inc_offset = [&offset](int x) { offset += x; };       // capture by reference
auto capture_all = [=](int x) { return x + offset; };      // capture all by value
```

**`std::function<Sig>`** stores any callable with signature `Sig`:
```cpp
#include <functional>
std::function<int(int)> fn = [](int x) { return x * x; };
fn(4);  // 16
```

**Lambdas with STL algorithms:**
```cpp
#include <algorithm>
#include <vector>

std::vector<int> v = {3, 1, 4, 1, 5};
std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });  // descending
int total = std::accumulate(v.begin(), v.end(), 0, [](int acc, int x) { return acc + x; });
```

**Mutable lambdas** — by default, value captures are `const`. Use `mutable` to allow mutation:
```cpp
int count = 0;
auto counter = [count]() mutable { return ++count; };  // modifies the captured copy
```

**vs other languages:** C++ lambdas are zero-overhead — the compiler typically inlines them. Unlike Java lambdas (which require a functional interface) or Python closures, C++ lambdas are full closures with explicit, fine-grained capture control.

## The task

Implement three functions:

- `std::function<int()> make_counter(int start = 0)` — returns a lambda that, each time called, returns the next integer starting from `start` (captures by reference internally via a mutable lambda or shared state)
- `std::vector<int> transform_if(std::vector<int> v, std::function<bool(int)> pred, std::function<int(int)> fn)` — return a new vector containing `fn(x)` for each `x` in `v` where `pred(x)` is true
- `std::function<int(int)> compose(std::function<int(int)> f, std::function<int(int)> g)` — return a new function that computes `f(g(x))`
