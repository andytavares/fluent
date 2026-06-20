// Compile: gcc -o test linked_lists_test.c && ./test
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int value; struct Node *next; } Node;

Node *list_push_front(Node *head, int value);
Node *list_push_back(Node *head, int value);
int list_length(Node *head);
Node *list_remove(Node *head, int value);
void list_free(Node *head);

static int passed = 0, failed = 0;
#define CHECK(name, cond) \
    do { if (cond) { printf("  PASS: %s\n", name); passed++; } \
         else      { printf("  FAIL: %s\n", name); failed++; } } while(0)

static int nth(Node *head, int n) {
    for (int i = 0; i < n && head; i++) head = head->next;
    return head ? head->value : -1;
}

int main(void) {
    // push_front
    Node *l = NULL;
    l = list_push_front(l, 3);
    l = list_push_front(l, 2);
    l = list_push_front(l, 1);
    CHECK("push_front: length 3", list_length(l) == 3);
    CHECK("push_front: order [0]", nth(l, 0) == 1);
    CHECK("push_front: order [1]", nth(l, 1) == 2);
    CHECK("push_front: order [2]", nth(l, 2) == 3);
    list_free(l);

    // push_back
    l = NULL;
    l = list_push_back(l, 10);
    l = list_push_back(l, 20);
    l = list_push_back(l, 30);
    CHECK("push_back: length 3", list_length(l) == 3);
    CHECK("push_back: order [0]", nth(l, 0) == 10);
    CHECK("push_back: order [2]", nth(l, 2) == 30);
    list_free(l);

    // length
    CHECK("length: empty list", list_length(NULL) == 0);
    l = list_push_front(NULL, 42);
    CHECK("length: single node", list_length(l) == 1);
    list_free(l);

    // remove: head node
    l = list_push_front(list_push_front(list_push_front(NULL, 3), 2), 1);
    l = list_remove(l, 1);
    CHECK("remove head: new head is 2", l && l->value == 2);
    CHECK("remove head: length 2", list_length(l) == 2);
    list_free(l);

    // remove: middle node
    l = list_push_front(list_push_front(list_push_front(NULL, 3), 2), 1);
    l = list_remove(l, 2);
    CHECK("remove middle: length 2", list_length(l) == 2);
    CHECK("remove middle: order", nth(l, 0) == 1 && nth(l, 1) == 3);
    list_free(l);

    // remove: last node
    l = list_push_front(list_push_front(list_push_front(NULL, 3), 2), 1);
    l = list_remove(l, 3);
    CHECK("remove last: length 2", list_length(l) == 2);
    list_free(l);

    // remove: not found (no-op)
    l = list_push_front(list_push_front(NULL, 2), 1);
    l = list_remove(l, 99);
    CHECK("remove not-found: length unchanged", list_length(l) == 2);
    list_free(l);

    // remove: empty list
    CHECK("remove empty: returns NULL", list_remove(NULL, 5) == NULL);

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
