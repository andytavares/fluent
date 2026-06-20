/*
 * Build: g++ -std=c++17 -o test stub.cpp stl_containers_test.cpp && ./test
 */
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>

std::vector<int> unique_sorted(std::vector<int> v);
std::unordered_map<std::string, int> word_count(const std::string& text);
std::vector<int> top_n(std::vector<int> v, int n);

static int passed = 0, failed = 0;

void check(const std::string& name, bool condition) {
    if (condition) { std::cout << "  PASS: " << name << "\n"; ++passed; }
    else           { std::cout << "  FAIL: " << name << "\n"; ++failed; }
}

int main() {
    // unique_sorted
    {
        auto r = unique_sorted({3, 1, 4, 1, 5, 9, 2, 6, 5});
        std::vector<int> want = {1, 2, 3, 4, 5, 6, 9};
        check("unique_sorted: dedup and sort",    r == want);
        check("unique_sorted: empty",             unique_sorted({}).empty());
        check("unique_sorted: already unique",    unique_sorted({1, 2, 3}) == std::vector<int>{1, 2, 3});
        check("unique_sorted: all same",          unique_sorted({5, 5, 5}) == std::vector<int>{5});
    }

    // word_count
    {
        auto wc = word_count("the cat sat on the mat the cat");
        check("word_count: the=3",   wc["the"] == 3);
        check("word_count: cat=2",   wc["cat"] == 2);
        check("word_count: sat=1",   wc["sat"] == 1);
        check("word_count: missing", wc.count("dog") == 0);
        check("word_count: empty",   word_count("").empty());
    }

    // top_n
    {
        auto t3 = top_n({3, 1, 4, 1, 5, 9, 2, 6}, 3);
        check("top_n(3): size",   t3.size() == 3);
        check("top_n(3): first",  t3[0] == 9);
        check("top_n(3): second", t3[1] == 6);
        check("top_n(3): third",  t3[2] == 5);
        check("top_n > size returns all sorted", top_n({3, 1, 2}, 10) == std::vector<int>{3, 2, 1});
        check("top_n empty", top_n({}, 3).empty());
    }

    std::cout << "\n" << passed << " passed, " << failed << " failed\n";
    return failed > 0 ? 1 : 0;
}
