// Compile and run: gcc -o test dynamic_memory_test.c && ./test
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int *create_int_array(int size);
int *resize_array(int *arr, int old_size, int new_size);
char *string_duplicate(const char *s);
void reverse_in_place(int *arr, int size);

static int passed = 0, failed = 0;

#define CHECK(name, cond) \
    do { \
        if (cond) { printf("  PASS: %s\n", name); passed++; } \
        else      { printf("  FAIL: %s\n", name); failed++; } \
    } while (0)

int main(void) {
    // create_int_array
    int *arr = create_int_array(5);
    CHECK("create_int_array: returns non-NULL", arr != NULL);
    if (arr) {
        CHECK("create_int_array: element 0 is zero", arr[0] == 0);
        CHECK("create_int_array: element 4 is zero", arr[4] == 0);
        arr[0] = 1; arr[1] = 2; arr[2] = 3;
        CHECK("create_int_array: write and read back", arr[2] == 3);

        // resize_array: grow
        int *big = resize_array(arr, 3, 6);
        CHECK("resize_array: grow returns non-NULL", big != NULL);
        if (big) {
            CHECK("resize_array: existing values preserved [0]", big[0] == 1);
            CHECK("resize_array: existing values preserved [1]", big[1] == 2);
            CHECK("resize_array: existing values preserved [2]", big[2] == 3);
            CHECK("resize_array: new slot [3] is zero", big[3] == 0);
            CHECK("resize_array: new slot [5] is zero", big[5] == 0);

            // resize_array: shrink
            int *small = resize_array(big, 6, 2);
            CHECK("resize_array: shrink returns non-NULL", small != NULL);
            if (small) {
                CHECK("resize_array: shrink [0]", small[0] == 1);
                CHECK("resize_array: shrink [1]", small[1] == 2);
                free(small);
            } else {
                free(big);
            }
        } else {
            free(arr);
        }
    }

    // string_duplicate
    const char *orig = "hello";
    char *dup = string_duplicate(orig);
    CHECK("string_duplicate: non-NULL", dup != NULL);
    if (dup) {
        CHECK("string_duplicate: content matches", strcmp(dup, orig) == 0);
        CHECK("string_duplicate: different pointer", dup != orig);
        free(dup);
    }

    char *empty = string_duplicate("");
    CHECK("string_duplicate: empty string non-NULL", empty != NULL);
    if (empty) {
        CHECK("string_duplicate: empty string content", empty[0] == '\0');
        free(empty);
    }

    // reverse_in_place
    int r5[] = {1, 2, 3, 4, 5};
    reverse_in_place(r5, 5);
    CHECK("reverse_in_place: [0]", r5[0] == 5);
    CHECK("reverse_in_place: [2]", r5[2] == 3);
    CHECK("reverse_in_place: [4]", r5[4] == 1);

    int r1[] = {42};
    reverse_in_place(r1, 1);
    CHECK("reverse_in_place: single element unchanged", r1[0] == 42);

    reverse_in_place(NULL, 0);
    CHECK("reverse_in_place: size 0 is a no-op", 1);

    int r2[] = {7, 8};
    reverse_in_place(r2, 2);
    CHECK("reverse_in_place: two elements", r2[0] == 8 && r2[1] == 7);

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
