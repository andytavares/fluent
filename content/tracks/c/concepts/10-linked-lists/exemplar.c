#include <stdlib.h>
#include <stdio.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

Node *list_push_front(Node *head, int value) {
    Node *n = malloc(sizeof(Node));
    if (!n) return head;
    n->value = value;
    n->next = head;
    return n;
}

Node *list_push_back(Node *head, int value) {
    Node *n = malloc(sizeof(Node));
    if (!n) return head;
    n->value = value;
    n->next = NULL;
    if (!head) return n;
    Node *cur = head;
    while (cur->next) cur = cur->next;
    cur->next = n;
    return head;
}

int list_length(Node *head) {
    int len = 0;
    for (Node *cur = head; cur; cur = cur->next) len++;
    return len;
}

Node *list_remove(Node *head, int value) {
    if (!head) return NULL;
    if (head->value == value) {
        Node *next = head->next;
        free(head);
        return next;
    }
    Node *cur = head;
    while (cur->next && cur->next->value != value) cur = cur->next;
    if (cur->next) {
        Node *to_remove = cur->next;
        cur->next = to_remove->next;
        free(to_remove);
    }
    return head;
}

void list_free(Node *head) {
    while (head) {
        Node *next = head->next;
        free(head);
        head = next;
    }
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
