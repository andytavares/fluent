#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <sstream>
#include <algorithm>

std::vector<int> unique_sorted(std::vector<int> v) {
    std::sort(v.begin(), v.end());
    v.erase(std::unique(v.begin(), v.end()), v.end());
    return v;
}

std::unordered_map<std::string, int> word_count(const std::string& text) {
    std::unordered_map<std::string, int> freq;
    std::istringstream iss(text);
    std::string word;
    while (iss >> word) freq[word]++;
    return freq;
}

std::vector<int> top_n(std::vector<int> v, int n) {
    std::sort(v.begin(), v.end(), std::greater<int>{});
    if (n < static_cast<int>(v.size())) v.resize(n);
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
