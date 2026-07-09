# Lambda Expressions

## What you'll learn

A lambda is an anonymous function defined inline. Unlike lambdas in Java (which must implement a functional interface) or Python (limited to a single expression), C++ lambdas are full closures with explicit, fine-grained control over what they capture from the surrounding scope — and, being ordinary objects under the hood, they're usually inlined away by the compiler for zero overhead.

## Key concepts

**Basic lambda syntax:**
```cpp
auto double_it = [](int x) { return x * 2; };
double_it(5);  // 10
```

**Capture clause** controls which outer variables the lambda can use, and how:
```cpp
int offset = 10;
auto add_offset  = [offset](int x)  { return x + offset; };  // capture by value (a copy)
auto inc_offset  = [&offset](int x) { offset += x; };        // capture by reference
auto capture_all = [=](int x)       { return x + offset; };  // capture everything used, by value
```

**`std::function<Sig>`** stores any callable matching signature `Sig` — a lambda, a function pointer, or a functor — behind one uniform type:
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

**Mutable lambdas** — by default, value captures are `const` inside the lambda body. Add `mutable` to allow the lambda to modify its own captured copy (the outer variable is unaffected):
```cpp
int count = 0;
auto counter = [count]() mutable { return ++count; };  // modifies the captured copy, not `count`
counter(); // 1
counter(); // 2
count;     // still 0 — the outer variable was never touched
```

**Init-captures (`[n = start]`)** let a lambda own state that didn't exist in the outer scope at all — useful for building factories that carry a private counter:
```cpp
auto make_counter = [start = 0]() mutable { return start++; };
```

**vs other languages:** JavaScript closures always capture by reference to the binding; Python closures are read-only unless you use `nonlocal`. C++ makes you choose, per variable, whether to copy or reference — which also means C++ is the one language on this list where a closure can outlive the thing it references and silently read garbage.

## Watch out

- **Capturing by reference and returning the lambda is a dangling-reference bug.** `[&x]` captures a reference to `x`'s storage; if the lambda is returned from the function (or otherwise outlives `x`'s scope), calling it reads memory that no longer belongs to `x`. If a lambda needs to outlive its defining scope, capture by value (`[x]`) or move ownership in (`[x = std::move(x)]`).
- **`[=]` and `[&]` capture *everything used in the body*,** which is easy to over-capture by accident — capturing `this` implicitly (pre-C++20) is a special case of this footgun inside member functions.
- **Value captures are `const` by default.** `[count](){ count++; }` doesn't compile without `mutable` — the compiler is telling you that you're mutating a captured copy, which is almost never what you meant unless you add `mutable` deliberately.

## The task

Implement three functions in `stub.cpp`.

**`std::function<int()> make_counter(int start = 0)`** — returns a callable that, on each call, returns the next integer starting at `start`: the first call returns `start`, the second returns `start + 1`, and so on. Counters returned by separate calls to `make_counter` are independent of each other.

```cpp
auto c = make_counter();     // start defaults to 0
c();  // 0
c();  // 1
c();  // 2

auto c2 = make_counter(10);
c2(); // 10
c2(); // 11
c();  // 3 — c is unaffected by c2
```

**`std::vector<int> transform_if(std::vector<int> v, std::function<bool(int)> pred, std::function<int(int)> fn)`** — returns a new vector containing `fn(x)` for every `x` in `v` for which `pred(x)` is `true`, preserving order. Elements that don't satisfy `pred` are skipped entirely (not included, not zeroed).

```cpp
transform_if({1, 2, 3, 4, 5},
             [](int n) { return n % 2 == 0; },   // pred: keep evens
             [](int n) { return n * 2; });        // fn: double them
// {4, 8}

transform_if({1, 3, 5}, [](int n){ return n % 2 == 0; }, [](int n){ return n; });
// {} — nothing matches pred
```

**`std::function<int(int)> compose(std::function<int(int)> f, std::function<int(int)> g)`** — function composition: returns a new callable that, given `x`, computes `f(g(x))` — that is, calling the result applies `g` to `x` first, then applies `f` to that result. This is the mathematical `f ∘ g`, read right-to-left.

```cpp
auto double_x = [](int x) { return x * 2; };
auto inc      = [](int x) { return x + 1; };

compose(double_x, inc)(3);  // double_x(inc(3)) = double_x(4) = 8
compose(inc, double_x)(3);  // inc(double_x(3)) = inc(6)      = 7 — order matters
```
