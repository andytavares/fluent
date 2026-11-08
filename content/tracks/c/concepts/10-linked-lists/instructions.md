## What you build

You write a singly linked list of `int` values: push at the front, push at the back, count, remove and free. C has no built-in list, so you build it from structs, pointers and `malloc`. This lesson builds on **Dynamic Memory**.

## Key concepts

### A node holds a value and a pointer to the next node

The struct needs a tag (`struct Node`) because the `next` field refers to the struct's own type.

```c
typedef struct Node {
    int value;
    struct Node *next;
} Node;
```

### Each node lives on the heap

A helper allocates one node and sets both fields. It returns `NULL` when `malloc` fails.

```c
Node *make_node(int value) {
    Node *n = malloc(sizeof(Node));
    if (!n) return NULL;
    n->value = value;
    n->next  = NULL;
    return n;
}
```

### Insert at the head in O(1)

The new node points at the old head and becomes the new head. The caller must store the returned pointer.

```c
Node *push_front(Node *head, int value) {
    Node *n = make_node(value);
    if (!n) return head;
    n->next = head;
    return n;
}
```

### Walk the list with a `for` loop

Start at `head` and follow `next` until it is `NULL`.

```c
for (Node *cur = head; cur != NULL;
     cur = cur->next) {
    printf("%d ", cur->value);
}
```

### Free the list one node at a time

Save `next` before you free the node. After `free`, you cannot read the node's fields.

```c
void list_free(Node *head) {
    while (head) {
        Node *next = head->next;
        free(head);
        head = next;
    }
}
```

### Lists trade random access for cheap inserts

Random access is O(n), and the cache performance is poor compared to arrays. Java, Python, Go and JavaScript use contiguous resizable arrays instead. In C, use a list for O(1) prepend, or to insert and remove nodes without copying.

## Watch out

- The list owns every node that the push functions allocate. Forget `list_free` and you leak memory.
- A freed node leaves dangling pointers. Always write `head = list_remove(head, v);` and drop the old `head`.
- If `malloc` returns `NULL`, the push functions must return the list unchanged. Do not dereference the `NULL` node.
- Removing the head changes the head. Without a `Node **` parameter, `list_remove` must return the new head.
- `list_free(NULL)` frees an empty list. It must do nothing and must not crash.

## The task

Write five functions for a singly linked list of `Node` structs. `head == NULL` is the empty list.

```c
typedef struct Node {
    int value;
    struct Node *next;
} Node;
```

1. `Node* list_push_front(Node *head, int value)` allocates a node with `value`. It inserts the node at the front and returns the new head.
2. `Node* list_push_back(Node *head, int value)` allocates a node with `value`. It inserts the node at the back and returns the head.
3. `list_push_back` returns a new head only when the list was empty.
4. `int list_length(Node *head)` returns the number of nodes. An empty list has length `0`.
5. `Node* list_remove(Node *head, int value)` removes the first node whose `value` equals `value`. It frees that node and returns the new head.
6. If no node matches, `list_remove` leaves the list unchanged and returns the same `head`.
7. `void list_free(Node *head)` frees every node. `list_free(NULL)` does nothing.

Only the push functions call `malloc`. Only `list_remove` and `list_free` call `free`. The caller never calls them directly.

```c
Node *l = NULL;
l = list_push_front(l, 3);  // 3
l = list_push_front(l, 2);  // 2 -> 3
l = list_push_front(l, 1);  // 1 -> 2 -> 3
list_length(l);             // 3
list_length(NULL);          // 0

// From 1 -> 2 -> 3 each time:
l = list_remove(l, 1);   // 2 -> 3
l = list_remove(l, 2);   // 1 -> 3
l = list_remove(l, 3);   // 1 -> 2
l = list_remove(l, 99);  // 1 -> 2 -> 3

list_remove(NULL, 5);       // NULL

Node *b = NULL;
b = list_push_back(b, 10);  // 10
b = list_push_back(b, 20);  // 10 -> 20
// 10 -> 20 -> 30
b = list_push_back(b, 30);

list_free(b);
list_free(NULL);            // no-op
```
