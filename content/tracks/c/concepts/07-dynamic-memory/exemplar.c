#include <stdlib.h>
#include <string.h>

int *create_int_array(int size) {
    return calloc(size, sizeof(int));
}

int *resize_array(int *arr, int old_size, int new_size) {
    int *new_arr = realloc(arr, new_size * sizeof(int));
    if (new_arr == NULL) return NULL;
    if (new_size > old_size) {
        memset(new_arr + old_size, 0, (new_size - old_size) * sizeof(int));
    }
    return new_arr;
}

char *string_duplicate(const char *s) {
    size_t len = strlen(s);
    char *copy = malloc(len + 1);
    if (copy == NULL) return NULL;
    memcpy(copy, s, len + 1);
    return copy;
}

void reverse_in_place(int *arr, int size) {
    for (int i = 0, j = size - 1; i < j; i++, j--) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
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
