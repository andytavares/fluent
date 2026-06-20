#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <sstream>
#include <algorithm>

// unique_sorted returns v with duplicates removed, sorted ascending.
std::vector<int> unique_sorted(std::vector<int> v) {
    // TODO
    return v;
}

// word_count returns a map of word → frequency for words in text.
std::unordered_map<std::string, int> word_count(const std::string& text) {
    // TODO
    return {};
}

// top_n returns the n largest elements of v sorted descending.
std::vector<int> top_n(std::vector<int> v, int n) {
    // TODO
    return v;
}

int main() {
    auto u = unique_sorted({3, 1, 4, 1, 5, 9, 2, 6, 5});
    for (int x : u) std::cout << x << " ";
    std::cout << "\n";

    auto wc = word_count("the cat sat on the mat the cat");
    std::cout << "the:" << wc["the"] << " cat:" << wc["cat"] << "\n";

    auto top = top_n({3, 1, 4, 1, 5, 9, 2, 6}, 3);
    for (int x : top) std::cout << x << " ";
    std::cout << "\n";
    return 0;
}
