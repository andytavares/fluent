#include <stdio.h>
#include <string.h>

/* str_count returns the number of times c appears in s. */
int str_count(const char *s, char c) {
    /* TODO */
    return 0;
}

/* str_reverse copies src into dst reversed and null-terminates dst. */
void str_reverse(const char *src, char *dst) {
    /* TODO */
    dst[0] = '\0';
}

/* str_starts_with returns 1 if s begins with prefix, 0 otherwise. */
int str_starts_with(const char *s, const char *prefix) {
    /* TODO */
    return 0;
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
