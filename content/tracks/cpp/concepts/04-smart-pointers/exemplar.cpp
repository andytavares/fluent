#include <iostream>
#include <memory>
#include <vector>

struct Node {
    int value;
    std::unique_ptr<Node> next;
    explicit Node(int v) : value(v) {}
};

std::unique_ptr<Node> build_list(const std::vector<int>& values) {
    if (values.empty()) return nullptr;
    auto head = std::make_unique<Node>(values[0]);
    Node* cur = head.get();
    for (std::size_t i = 1; i < values.size(); ++i) {
        cur->next = std::make_unique<Node>(values[i]);
        cur = cur->next.get();
    }
    return head;
}

int list_sum(const Node* head) {
    int total = 0;
    for (const Node* n = head; n; n = n->next.get()) total += n->value;
    return total;
}

int list_length(const Node* head) {
    int count = 0;
    for (const Node* n = head; n; n = n->next.get()) ++count;
    return count;
}

int main() {
    auto head = build_list({1, 2, 3, 4, 5});
    std::cout << "sum: "    << list_sum(head.get())    << "\n";
    std::cout << "length: " << list_length(head.get()) << "\n";
    return 0;
}
