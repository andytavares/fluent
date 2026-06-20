#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// count_lines returns the number of newline-terminated lines in filename.
// Returns -1 on error.
int count_lines(const char *filename) {
    // TODO
    return -1;
}

// file_size returns the size of filename in bytes, or -1 on error.
long file_size(const char *filename) {
    // TODO
    return -1;
}

// copy_file copies all bytes from src to dst.
// Returns 0 on success, -1 on error.
int copy_file(const char *src, const char *dst) {
    // TODO
    return -1;
}

// write_ints writes n ints to filename in binary format.
// Returns 0 on success, -1 on error.
int write_ints(const char *filename, const int *arr, int n) {
    // TODO
    return -1;
}

// read_ints reads up to max_n ints from filename (binary format).
// Returns the number of ints read, or -1 on error.
int read_ints(const char *filename, int *arr, int max_n) {
    // TODO
    return -1;
}

int main(void) {
    const char *path = "/tmp/fluent_test.txt";
    FILE *f = fopen(path, "w");
    if (f) {
        fprintf(f, "line one\nline two\nline three\n");
        fclose(f);
    }
    printf("lines: %d\n", count_lines(path));
    printf("size: %ld\n", file_size(path));
    return 0;
}
