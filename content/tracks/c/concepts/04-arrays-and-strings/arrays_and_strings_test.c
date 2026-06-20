/*
 * Build: gcc -o test stub.c arrays_and_strings_test.c && ./test
 */
#include <stdio.h>
#include <string.h>

int  str_count(const char *s, char c);
void str_reverse(const char *src, char *dst);
int  str_starts_with(const char *s, const char *prefix);

static int passed = 0, failed = 0;

#define CHECK_INT(name, expected, actual) \
    do { \
        int _e = (expected), _a = (actual); \
        if (_e == _a) { printf("  PASS: %s\n", name); passed++; } \
        else { printf("  FAIL: %s — expected %d, got %d\n", name, _e, _a); failed++; } \
    } while (0)

#define CHECK_STR(name, expected, actual) \
    do { \
        if (strcmp((expected), (actual)) == 0) { printf("  PASS: %s\n", name); passed++; } \
        else { printf("  FAIL: %s — expected \"%s\", got \"%s\"\n", name, expected, actual); failed++; } \
    } while (0)

int main(void) {
    /* str_count */
    CHECK_INT("str_count 'l' in hello",   2, str_count("hello", 'l'));
    CHECK_INT("str_count 'a' in banana",  3, str_count("banana", 'a'));
    CHECK_INT("str_count missing char",   0, str_count("hello", 'z'));
    CHECK_INT("str_count empty string",   0, str_count("", 'a'));

    /* str_reverse */
    char buf[64];
    str_reverse("abcde", buf); CHECK_STR("reverse abcde",  "edcba", buf);
    str_reverse("a",     buf); CHECK_STR("reverse single", "a",     buf);
    str_reverse("",      buf); CHECK_STR("reverse empty",  "",      buf);
    str_reverse("abba",  buf); CHECK_STR("reverse abba",   "abba",  buf);

    /* str_starts_with */
    CHECK_INT("starts_with: match",        1, str_starts_with("foobar", "foo"));
    CHECK_INT("starts_with: no match",     0, str_starts_with("foobar", "bar"));
    CHECK_INT("starts_with: empty prefix", 1, str_starts_with("foobar", ""));
    CHECK_INT("starts_with: exact match",  1, str_starts_with("hello",  "hello"));
    CHECK_INT("starts_with: longer prefix",0, str_starts_with("hi",     "hillo"));

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
