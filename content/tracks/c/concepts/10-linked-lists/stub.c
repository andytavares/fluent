#include <stdlib.h>
#include <stdio.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

// list_push_front inserts a new node at the front and returns the new head.
Node *list_push_front(Node *head, int value) {
    // TODO
    return head;
}

// list_push_back inserts a new node at the back and returns the (possibly unchanged) head.
Node *list_push_back(Node *head, int value) {
    // TODO
    return head;
}

// list_length returns the number of nodes.
int list_length(Node *head) {
    // TODO
    return 0;
}

// list_remove removes the first node with the given value. Returns the new head.
Node *list_remove(Node *head, int value) {
    // TODO
    return head;
}

// list_free frees all nodes in the list.
void list_free(Node *head) {
    // TODO
}

int main(void) {
    Node *list = NULL;
    list = list_push_front(list, 3);
    list = list_push_front(list, 2);
    list = list_push_front(list, 1);
    printf("length: %d\n", list_length(list));
    list_free(list);
    return 0;
}
