#include <atomic>
#include <thread>
#include <mutex>
#include <future>
#include <vector>
#include <numeric>

class Counter {
public:
    Counter() : value_(0) {}

    void increment() { value_++; }
    void decrement() { value_--; }
    int value() const { return value_.load(); }

private:
    std::atomic<int> value_;
};

int parallel_sum(const std::vector<int>& data, int num_threads) {
    if (data.empty() || num_threads <= 0) return 0;
    int total = 0;
    std::mutex mtx;
    std::vector<std::thread> threads;
    size_t chunk = (data.size() + num_threads - 1) / num_threads;

    for (int i = 0; i < num_threads; ++i) {
        size_t start = i * chunk;
        if (start >= data.size()) break;
        size_t end = std::min(start + chunk, data.size());
        threads.emplace_back([&, start, end]() {
            int local = 0;
            for (size_t j = start; j < end; ++j) local += data[j];
            std::lock_guard<std::mutex> lock(mtx);
            total += local;
        });
    }
    for (auto& t : threads) t.join();
    return total;
}

std::future<int> async_square(int n) {
    return std::async(std::launch::async, [n] { return n * n; });
}

int main() {
    Counter c;
    c.increment();
    c.increment();
    c.decrement();
    return 0;
}
