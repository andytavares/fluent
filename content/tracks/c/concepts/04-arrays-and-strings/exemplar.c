#include <stdio.h>
#include <string.h>

int str_count(const char *s, char c) {
    int count = 0;
    while (*s) {
        if (*s == c) count++;
        s++;
    }
    return count;
}

void str_reverse(const char *src, char *dst) {
    int len = (int)strlen(src);
    for (int i = 0; i < len; i++) {
        dst[i] = src[len - 1 - i];
    }
    dst[len] = '\0';
}

int str_starts_with(const char *s, const char *prefix) {
    while (*prefix) {
        if (*s != *prefix) return 0;
        s++;
        prefix++;
    }
    return 1;
}

int main(void) {
    printf("str_count(\"hello\", 'l') = %d\n", str_count("hello", 'l'));

    char buf[64];
    str_reverse("abcde", buf);
    printf("reverse(\"abcde\") = %s\n", buf);

    printf("starts_with(\"foobar\", \"foo\") = %d\n", str_starts_with("foobar", "foo"));
    printf("starts_with(\"foobar\", \"bar\") = %d\n", str_starts_with("foobar", "bar"));
    return 0;
}
