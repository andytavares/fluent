# Linked Lists

## What you'll learn

A linked list is a fundamental data structure where each node holds a value and a pointer to the next node. In C you build them explicitly with structs and pointers — there is no built-in. Understanding linked lists cements your grasp of pointers, dynamic allocation, and manual memory management.

## Key concepts

**Node definition:**
```c
typedef struct Node {
    int value;
    struct Node *next;
} Node;
```

**Creating a node:**
```c
Node *make_node(int value) {
    Node *n = malloc(sizeof(Node));
    if (!n) return NULL;
    n->value = value;
    n->next  = NULL;
    return n;
}
```

**Inserting at the head (O(1)):**
```c
Node *push_front(Node *head, int value) {
    Node *n = make_node(value);
    if (!n) return head;
    n->next = head;
    return n;  // new head
}
```

**Traversal:**
```c
for (Node *cur = head; cur != NULL; cur = cur->next) {
    printf("%d ", cur->value);
}
```

**Freeing the entire list:**
```c
void list_free(Node *head) {
    while (head) {
        Node *next = head->next;
        free(head);
        head = next;
    }
}
```

**vs other languages:** Java, Python, Go, and JavaScript all have resizable arrays (`ArrayList`, `list`, `slice`, `Array`) that are backed by contiguous memory and are cache-friendly — linked lists are rarely the right choice there. In C you sometimes need a linked list for O(1) prepend or when nodes must be inserted/removed without copying, but understand that random access is O(n) and cache performance is poor compared to arrays.

## The task

Implement the following functions in `stub.c`. All functions operate on a singly-linked list of `Node` structs where `head` is `NULL` for an empty list. Callers are responsible for freeing memory using `list_free`.

- `Node* list_push_front(Node *head, int value)` — insert a new node at the front; return the new head
- `Node* list_push_back(Node *head, int value)` — insert a new node at the back; return the (possibly unchanged) head
- `int list_length(Node *head)` — return the number of nodes
- `Node* list_remove(Node *head, int value)` — remove the first node whose value equals `value`; return the new head (unchanged if not found)
- `void list_free(Node *head)` — free all nodes in the list
