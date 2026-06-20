#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int count_lines(const char *filename) {
    FILE *f = fopen(filename, "r");
    if (!f) return -1;
    int lines = 0;
    char buf[4096];
    while (fgets(buf, sizeof(buf), f)) {
        if (strchr(buf, '\n')) lines++;
    }
    fclose(f);
    return lines;
}

long file_size(const char *filename) {
    FILE *f = fopen(filename, "rb");
    if (!f) return -1;
    if (fseek(f, 0, SEEK_END) != 0) { fclose(f); return -1; }
    long size = ftell(f);
    fclose(f);
    return size;
}

int copy_file(const char *src, const char *dst) {
    FILE *in = fopen(src, "rb");
    if (!in) return -1;
    FILE *out = fopen(dst, "wb");
    if (!out) { fclose(in); return -1; }
    char buf[4096];
    size_t n;
    while ((n = fread(buf, 1, sizeof(buf), in)) > 0) {
        if (fwrite(buf, 1, n, out) != n) { fclose(in); fclose(out); return -1; }
    }
    int ok = !ferror(in);
    fclose(in);
    fclose(out);
    return ok ? 0 : -1;
}

int write_ints(const char *filename, const int *arr, int n) {
    FILE *f = fopen(filename, "wb");
    if (!f) return -1;
    size_t written = fwrite(arr, sizeof(int), n, f);
    fclose(f);
    return (written == (size_t)n) ? 0 : -1;
}

int read_ints(const char *filename, int *arr, int max_n) {
    FILE *f = fopen(filename, "rb");
    if (!f) return -1;
    int count = (int)fread(arr, sizeof(int), max_n, f);
    int err = ferror(f);
    fclose(f);
    return err ? -1 : count;
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
