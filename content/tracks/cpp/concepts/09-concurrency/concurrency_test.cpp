// Test runner — concatenated after stub.cpp (with main() stripped) into one
// translation unit.
// Build: g++ -std=c++17 -pthread -o test stub.cpp concurrency_test.cpp && ./test
#include <atomic>
#include <thread>
#include <mutex>
#include <future>
#include <vector>
#include <numeric>
#include <cstdio>

static int passed = 0, failed = 0;
#define CHECK(name, cond) \
    do { if (cond) { printf("  PASS: %s\n", name); passed++; } \
         else      { printf("  FAIL: %s\n", name); failed++; } } while(0)

int main() {
    // Counter
    {
        Counter c;
        CHECK("Counter: initial value 0", c.value() == 0);
        c.increment(); c.increment();
        CHECK("Counter: after 2 increments", c.value() == 2);
        c.decrement();
        CHECK("Counter: after decrement", c.value() == 1);
    }

    // Counter: concurrent increments
    {
        Counter c;
        std::vector<std::thread> threads;
        for (int i = 0; i < 100; ++i)
            threads.emplace_back([&] { c.increment(); });
        for (auto& t : threads) t.join();
        CHECK("Counter: 100 concurrent increments", c.value() == 100);
    }

    // Counter: concurrent increments and decrements
    {
        Counter c;
        std::vector<std::thread> threads;
        for (int i = 0; i < 50; ++i) threads.emplace_back([&] { c.increment(); });
        for (int i = 0; i < 30; ++i) threads.emplace_back([&] { c.decrement(); });
        for (auto& t : threads) t.join();
        CHECK("Counter: 50 up, 30 down nets to 20", c.value() == 20);
    }

    // parallel_sum
    {
        std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        CHECK("parallel_sum: 1 thread",  parallel_sum(data, 1)  == 55);
        CHECK("parallel_sum: 2 threads", parallel_sum(data, 2)  == 55);
        CHECK("parallel_sum: 4 threads", parallel_sum(data, 4)  == 55);
        CHECK("parallel_sum: more threads than elements", parallel_sum(data, 20) == 55);
        CHECK("parallel_sum: empty",     parallel_sum({}, 4)    == 0);
        CHECK("parallel_sum: 1 element", parallel_sum({42}, 2)  == 42);
    }

    // async_square
    {
        auto f1 = async_square(5);
        CHECK("async_square: 5^2 = 25", f1.get() == 25);
        auto f2 = async_square(0);
        CHECK("async_square: 0^2 = 0", f2.get() == 0);
        auto f3 = async_square(-3);
        CHECK("async_square: (-3)^2 = 9", f3.get() == 9);
    }

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
