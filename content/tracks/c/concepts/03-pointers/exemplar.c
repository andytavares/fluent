#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int sum_array(const int *arr, int n) {
    int total = 0;
    for (int i = 0; i < n; i++) total += arr[i];
    return total;
}

void reverse_array(int *arr, int n) {
    for (int i = 0, j = n - 1; i < j; i++, j--) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

int main(void) {
    int x = 3, y = 7;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);

    int nums[] = {1, 2, 3, 4, 5};
    printf("sum=%d\n", sum_array(nums, 5));

    reverse_array(nums, 5);
    for (int i = 0; i < 5; i++) printf("%d ", nums[i]);
    printf("\n");
    return 0;
}
