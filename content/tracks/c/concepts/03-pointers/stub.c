#include <stdio.h>

/* swap exchanges the values at a and b. */
void swap(int *a, int *b) {
    /* TODO */
}

/* sum_array returns the sum of n integers starting at arr. */
int sum_array(const int *arr, int n) {
    /* TODO */
    return 0;
}

/* reverse_array reverses arr of length n in-place. */
void reverse_array(int *arr, int n) {
    /* TODO */
}

int main(void) {
    int x = 3, y = 7;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);  /* x=7 y=3 */

    int nums[] = {1, 2, 3, 4, 5};
    printf("sum=%d\n", sum_array(nums, 5));  /* 15 */

    reverse_array(nums, 5);
    for (int i = 0; i < 5; i++) printf("%d ", nums[i]);
    printf("\n");
    return 0;
}
