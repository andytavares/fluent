#include <iostream>
#include <memory>
#include <vector>

struct Node {
    int value;
    std::unique_ptr<Node> next;
    explicit Node(int v) : value(v) {}
};

// build_list creates a linked list from values and returns a unique_ptr to the head.
std::unique_ptr<Node> build_list(const std::vector<int>& values) {
    // TODO
    return nullptr;
}

// list_sum returns the sum of all node values.
int list_sum(const Node* head) {
    // TODO
    return 0;
}

// list_length returns the number of nodes.
int list_length(const Node* head) {
    // TODO
    return 0;
}

int main() {
    auto head = build_list({1, 2, 3, 4, 5});
    std::cout << "sum: "    << list_sum(head.get())    << "\n";  // 15
    std::cout << "length: " << list_length(head.get()) << "\n";  // 5
    return 0;
}
