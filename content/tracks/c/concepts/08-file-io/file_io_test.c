// Compile: gcc -o test file_io_test.c && ./test
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int count_lines(const char *filename);
long file_size(const char *filename);
int copy_file(const char *src, const char *dst);
int write_ints(const char *filename, const int *arr, int n);
int read_ints(const char *filename, int *arr, int max_n);

static int passed = 0, failed = 0;
#define CHECK(name, cond) \
    do { if (cond) { printf("  PASS: %s\n", name); passed++; } \
         else      { printf("  FAIL: %s\n", name); failed++; } } while(0)

static void write_text(const char *path, const char *content) {
    FILE *f = fopen(path, "w");
    if (f) { fputs(content, f); fclose(f); }
}

int main(void) {
    const char *txt = "/tmp/fluent_fileio_test.txt";
    const char *bin = "/tmp/fluent_fileio_test.bin";
    const char *cpy = "/tmp/fluent_fileio_copy.txt";

    // count_lines
    write_text(txt, "alpha\nbeta\ngamma\n");
    CHECK("count_lines: 3 lines", count_lines(txt) == 3);

    write_text(txt, "single\n");
    CHECK("count_lines: 1 line", count_lines(txt) == 1);

    write_text(txt, "");
    CHECK("count_lines: empty file = 0", count_lines(txt) == 0);

    CHECK("count_lines: missing file = -1", count_lines("/tmp/no_such_file_xyz.txt") == -1);

    // file_size
    write_text(txt, "hello");
    CHECK("file_size: 5 bytes", file_size(txt) == 5);

    write_text(txt, "");
    CHECK("file_size: empty = 0", file_size(txt) == 0);

    // copy_file
    write_text(txt, "copy me\n");
    CHECK("copy_file: returns 0", copy_file(txt, cpy) == 0);
    CHECK("copy_file: sizes match", file_size(txt) == file_size(cpy));

    // write_ints / read_ints
    int data[] = {10, 20, 30, 40, 50};
    CHECK("write_ints: returns 0", write_ints(bin, data, 5) == 0);

    int buf[10] = {0};
    int n = read_ints(bin, buf, 10);
    CHECK("read_ints: returns count 5", n == 5);
    CHECK("read_ints: value [0]", buf[0] == 10);
    CHECK("read_ints: value [4]", buf[4] == 50);

    int small[2] = {0};
    int m = read_ints(bin, small, 2);
    CHECK("read_ints: respects max_n", m == 2);
    CHECK("read_ints: partial read value", small[0] == 10 && small[1] == 20);

    remove(txt); remove(bin); remove(cpy);

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
