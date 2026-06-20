#include <iostream>
#include <functional>
#include <vector>
#include <algorithm>

// make_counter returns a lambda that returns start, start+1, start+2, ...
std::function<int()> make_counter(int start = 0) {
    // TODO
    return [start]() mutable { return start; };
}

// transform_if applies fn to elements of v satisfying pred, returns results.
std::vector<int> transform_if(
    std::vector<int> v,
    std::function<bool(int)> pred,
    std::function<int(int)> fn)
{
    // TODO
    return {};
}

// compose returns a function that computes f(g(x)).
std::function<int(int)> compose(
    std::function<int(int)> f,
    std::function<int(int)> g)
{
    // TODO
    return [](int x) { return x; };
}

int main() {
    auto c = make_counter();
    std::cout << c() << " " << c() << " " << c() << "\n";  // 0 1 2

    auto doubled_evens = transform_if({1,2,3,4,5}, [](int n){ return n%2==0; }, [](int n){ return n*2; });
    for (int x : doubled_evens) std::cout << x << " ";  // 4 8
    std::cout << "\n";

    auto double_then_inc = compose([](int x){ return x+1; }, [](int x){ return x*2; });
    std::cout << double_then_inc(3) << "\n";  // 7
    return 0;
}
