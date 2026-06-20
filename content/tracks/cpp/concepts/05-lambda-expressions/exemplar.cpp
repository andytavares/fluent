#include <iostream>
#include <functional>
#include <vector>
#include <algorithm>

std::function<int()> make_counter(int start) {
    return [n = start]() mutable { return n++; };
}

std::vector<int> transform_if(
    std::vector<int> v,
    std::function<bool(int)> pred,
    std::function<int(int)> fn)
{
    std::vector<int> result;
    for (int x : v) {
        if (pred(x)) result.push_back(fn(x));
    }
    return result;
}

std::function<int(int)> compose(
    std::function<int(int)> f,
    std::function<int(int)> g)
{
    return [f, g](int x) { return f(g(x)); };
}

int main() {
    auto c = make_counter();
    std::cout << c() << " " << c() << " " << c() << "\n";

    auto doubled_evens = transform_if({1,2,3,4,5}, [](int n){ return n%2==0; }, [](int n){ return n*2; });
    for (int x : doubled_evens) std::cout << x << " ";
    std::cout << "\n";

    auto double_then_inc = compose([](int x){ return x+1; }, [](int x){ return x*2; });
    std::cout << double_then_inc(3) << "\n";
    return 0;
}
