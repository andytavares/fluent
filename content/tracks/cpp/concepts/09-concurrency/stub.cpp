#include <atomic>
#include <thread>
#include <mutex>
#include <future>
#include <vector>
#include <numeric>

// Counter is a thread-safe integer counter backed by std::atomic.
class Counter {
public:
    Counter() : value_(0) {}

    void increment() {
        // TODO
    }

    void decrement() {
        // TODO
    }

    int value() const {
        // TODO
        return 0;
    }

private:
    std::atomic<int> value_;
};

// parallel_sum splits data into num_threads chunks and sums them concurrently.
int parallel_sum(const std::vector<int>& data, int num_threads) {
    // TODO
    return 0;
}

// async_square returns a future that resolves to n * n.
std::future<int> async_square(int n) {
    // TODO
    return std::async(std::launch::async, [] { return 0; });
}

int main() {
    Counter c;
    c.increment();
    c.increment();
    c.decrement();
    // value should be 1
    return 0;
}
