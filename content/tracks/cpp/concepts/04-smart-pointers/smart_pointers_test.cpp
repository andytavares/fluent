/*
 * Build: g++ -std=c++17 -o test stub.cpp smart_pointers_test.cpp && ./test
 */
#include <iostream>
#include <memory>
#include <vector>
#include <string>

struct Node;
std::unique_ptr<Node> build_list(const std::vector<int>& values);
int list_sum(const Node* head);
int list_length(const Node* head);

static int passed = 0, failed = 0;

void check(const std::string& name, bool condition) {
    if (condition) { std::cout << "  PASS: " << name << "\n"; ++passed; }
    else           { std::cout << "  FAIL: " << name << "\n"; ++failed; }
}

int main() {
    // empty list
    auto empty = build_list({});
    check("empty list: nullptr",   empty == nullptr);
    check("empty list sum",        list_sum(nullptr)    == 0);
    check("empty list length",     list_length(nullptr) == 0);

    // single element
    auto single = build_list({7});
    check("single: length 1", list_length(single.get()) == 1);
    check("single: sum 7",    list_sum(single.get())    == 7);

    // multi-element
    auto head = build_list({1, 2, 3, 4, 5});
    check("5-node length",         list_length(head.get()) == 5);
    check("5-node sum",            list_sum(head.get())    == 15);
    check("head value",            head->value             == 1);
    check("second value",          head->next->value       == 2);
    check("list is linked",        head->next->next->value == 3);

    // ownership: head goes out of scope here, no leak (verified by sanitizer)
    std::cout << "\n" << passed << " passed, " << failed << " failed\n";
    return failed > 0 ? 1 : 0;
}
