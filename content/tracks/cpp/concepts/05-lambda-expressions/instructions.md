## What you build

You write `make_counter`, `transform_if` and `compose` with lambdas. A lambda is an anonymous function that you define inline. This lesson builds on **Smart Pointers**.

## Key concepts

### A lambda is a full closure

Java lambdas must implement a functional interface, and Python lambdas hold one expression. A C++ lambda can hold any body. It is an ordinary object, and the compiler usually inlines it, so it has zero overhead.

```cpp
auto double_it = [](int x) {
    return x * 2;
};
double_it(5);  // 10
```

### The capture clause controls access to outer variables

You choose, for each variable, a copy or a reference. JavaScript closures always capture by reference to the binding. Python closures are read-only unless you use `nonlocal`.

```cpp
int offset = 10;
// By value: a copy
auto add = [offset](int x) {
    return x + offset;
};
// By reference
auto inc = [&offset](int x) {
    offset += x;
};
// Everything used, by value
auto all = [=](int x) {
    return x + offset;
};
```

### `std::function` stores any callable

`std::function<Sig>` holds any callable that matches the signature `Sig`. That includes a lambda, a function pointer or a functor. All of them get one uniform type.

```cpp
#include <functional>
std::function<int(int)> fn =
    [](int x) { return x * x; };
fn(4);  // 16
```

### Lambdas customize STL algorithms

Pass a lambda as the comparison or the operation.

```cpp
#include <algorithm>
#include <numeric>
#include <vector>

std::vector<int> v = {3, 1, 4, 1, 5};
// Descending order
std::sort(v.begin(), v.end(),
    [](int a, int b) { return a > b; });
int total = std::accumulate(
    v.begin(), v.end(), 0,
    [](int acc, int x) {
        return acc + x;
    });
```

### `mutable` lets a lambda change its own copy

Value captures are `const` in the lambda body by default. `mutable` lets the lambda change its captured copy. The outer variable does not change.

```cpp
int count = 0;
auto counter = [count]() mutable {
    return ++count;
};
counter();  // 1
counter();  // 2
count;      // still 0
```

### An init-capture creates new state

`[n = start]` gives the lambda its own variable. The variable does not need to exist in the outer scope. A factory can use it to carry a private counter.

```cpp
auto next_id = [start = 0]() mutable {
    return start++;
};
```

## Watch out

- `[&x]` captures a reference to the storage of `x`. If the lambda outlives `x`, a call reads freed memory.
- A lambda that outlives its scope must capture by value (`[x]`) or move ownership in (`[x = std::move(x)]`).
- `[=]` and `[&]` capture everything the body uses. It is easy to capture more than you mean.
- In a member function, `[=]` captures `this` implicitly before C++20. That is the same mistake.
- Value captures are `const`. `[count]() { count++; }` does not compile without `mutable`.
- Add `mutable` only on purpose. It changes the captured copy, which is rarely the goal.

## The task

Write three functions in `stub.cpp`. Each one returns or takes a lambda.

1. `std::function<int()> make_counter(int start = 0)` returns a callable counter.
2. The first call of the counter returns `start`. Each later call returns the previous value plus 1.
3. `start` is 0 when the caller leaves it out.
4. Counters from separate `make_counter` calls are independent.
5. `std::vector<int> transform_if(std::vector<int> v, std::function<bool(int)> pred, std::function<int(int)> fn)` returns a new vector.
6. The result holds `fn(x)` for each `x` in `v` where `pred(x)` is `true`, in the original order.
7. `transform_if` skips each element that fails `pred`. It does not add a zero for it.
8. `std::function<int(int)> compose(std::function<int(int)> f, std::function<int(int)> g)` returns a new callable.
9. Given `x`, the callable returns `f(g(x))`. It applies `g` first, then `f`. This is `f ∘ g`.

```cpp
auto c = make_counter();
c();   // 0
c();   // 1
c();   // 2
auto c2 = make_counter(10);
c2();  // 10
c2();  // 11
// c does not see c2
c();   // 3

auto even = [](int n) {
    return n % 2 == 0;
};
auto twice = [](int n) { return n * 2; };
auto same = [](int n) { return n; };
transform_if({1, 2, 3, 4, 5}, even, twice);
// {4, 8}
transform_if({1, 3, 5}, even, same);
// {}

auto inc = [](int x) { return x + 1; };
// twice(inc(3)) = 8
compose(twice, inc)(3);
// inc(twice(3)) = 7
compose(inc, twice)(3);
// inc(twice(0)) = 1
compose(inc, twice)(0);
```
