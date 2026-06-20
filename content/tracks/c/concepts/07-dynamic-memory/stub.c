#include <stdlib.h>
#include <string.h>

// create_int_array allocates a zero-initialized array of size ints.
// Returns NULL on allocation failure. Caller must free the result.
int *create_int_array(int size) {
    // TODO
    return NULL;
}

// resize_array resizes arr from old_size to new_size.
// New slots (if growing) are zero-initialized.
// Returns the new pointer, or NULL on failure. Caller must free the result.
int *resize_array(int *arr, int old_size, int new_size) {
    // TODO
    return NULL;
}

// string_duplicate returns a heap-allocated copy of s.
// Returns NULL on allocation failure. Caller must free the result.
char *string_duplicate(const char *s) {
    // TODO
    return NULL;
}

// reverse_in_place reverses arr in place.
void reverse_in_place(int *arr, int size) {
    // TODO
}

int main(void) {
    int *arr = create_int_array(5);
    if (arr) {
        arr[0] = 10;
        arr[4] = 99;
        reverse_in_place(arr, 5);
        free(arr);
    }

    char *s = string_duplicate("hello");
    if (s) {
        free(s);
    }

    return 0;
}
