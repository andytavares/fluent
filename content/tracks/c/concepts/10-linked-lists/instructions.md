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

## Watch out

- **Every node returned by `list_push_front`/`list_push_back` is heap-allocated** (via `malloc` inside those functions) — the list owns that memory until `list_remove` frees an individual node or `list_free` frees the whole chain. Forgetting to call `list_free` on a list you're done with is a memory leak.
- **Use-after-free**: once `list_remove` or `list_free` frees a node, any pointer still referring to it (including a stale `head` variable in the caller) is dangling. Always reassign `head = list_remove(head, v);` — never keep using the old `head` afterward.
- `list_push_front`/`list_push_back` on allocation failure (`malloc` returns `NULL`) must not crash — return the list unchanged rather than dereferencing a `NULL` new node.
- Removing the head node changes what `head` *is* — `list_remove` must return the new head to the caller; there's no way to mutate the caller's `head` variable in place without an extra layer of indirection (`Node **`), which this exercise doesn't use.
- `list_free(NULL)` (freeing an empty list) must be a safe no-op, not a crash.

## The task

Implement the following functions. All operate on a singly-linked list of `Node` structs where `head == NULL` represents the empty list. Every node is allocated with `malloc` inside `list_push_front`/`list_push_back`; the list itself owns those nodes until they are explicitly freed by `list_remove` (one node) or `list_free` (the whole list) — the caller never touches `malloc`/`free` directly.

- `Node* list_push_front(Node *head, int value)` — allocate a new node holding `value`, insert it at the front, and return the new head
- `Node* list_push_back(Node *head, int value)` — allocate a new node holding `value`, insert it at the back, and return the head (unchanged unless the list was empty)
- `int list_length(Node *head)` — return the number of nodes (`0` for an empty list)
- `Node* list_remove(Node *head, int value)` — free and remove the first node whose `value` field equals `value`; return the new head. If no node matches, the list is unchanged and the same `head` is returned.
- `void list_free(Node *head)` — free every node in the list; safe to call with `head == NULL`

```c
Node *l = NULL;
l = list_push_front(l, 3);   // list: 3
l = list_push_front(l, 2);   // list: 2 -> 3
l = list_push_front(l, 1);   // list: 1 -> 2 -> 3
list_length(l);              // 3

l = list_remove(l, 2);       // list: 1 -> 3  (middle node freed)
l = list_remove(l, 1);       // list: 3       (head node freed; l now points at the old second node)
list_remove(NULL, 5);        // NULL — removing from an empty list is a no-op

Node *b = NULL;
b = list_push_back(b, 10);   // list: 10
b = list_push_back(b, 20);   // list: 10 -> 20

list_free(l);
list_free(b);
list_free(NULL);             // safe no-op
```
