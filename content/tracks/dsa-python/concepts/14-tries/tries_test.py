import sys
from stub import Trie, WordDictionary

passed = 0
failed = 0


def test(name, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS: {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL: {name} — {e}")
        failed += 1


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


# -- Trie: insert + search (exact match) --
def _search_finds():
    t = Trie()
    t.insert("apple")
    assert_eq(t.search("apple"), True)


test("Trie: search finds an inserted word", _search_finds)


def _search_rejects_prefix():
    t = Trie()
    t.insert("apple")
    assert_eq(t.search("app"), False)


test("Trie: search rejects a prefix of an inserted word", _search_rejects_prefix)


def _search_rejects_unknown():
    t = Trie()
    t.insert("apple")
    assert_eq(t.search("banana"), False)


test("Trie: search rejects a word never inserted", _search_rejects_unknown)


def _search_finds_prefix_once_inserted():
    t = Trie()
    t.insert("apple")
    t.insert("app")
    assert_eq(t.search("app"), True)


test("Trie: search finds a prefix once it is inserted itself", _search_finds_prefix_once_inserted)


def _single_char():
    t = Trie()
    t.insert("a")
    assert_eq(t.search("a"), True)
    assert_eq(t.search("ab"), False)


test("Trie: single-character word", _single_char)


def _query_longer():
    t = Trie()
    t.insert("cat")
    assert_eq(t.search("catfish"), False)


test("Trie: query longer than every stored word", _query_longer)


def _shared_prefix():
    t = Trie()
    for w in ["car", "card", "care", "careful"]:
        t.insert(w)
    assert_eq(t.search("car"), True)
    assert_eq(t.search("card"), True)
    assert_eq(t.search("careful"), True)
    assert_eq(t.search("ca"), False)
    assert_eq(t.search("cards"), False)


test("Trie: words sharing a prefix are all found", _shared_prefix)


def _insert_twice():
    t = Trie()
    t.insert("dog")
    t.insert("dog")
    assert_eq(t.search("dog"), True)
    assert_eq(t.search("do"), False)


test("Trie: inserting the same word twice is harmless", _insert_twice)

# -- Trie: starts_with --


def _starts_with_proper_prefix():
    t = Trie()
    t.insert("apple")
    assert_eq(t.starts_with("app"), True)


test("Trie: starts_with true for a proper prefix", _starts_with_proper_prefix)


def _starts_with_exact():
    t = Trie()
    t.insert("apple")
    assert_eq(t.starts_with("apple"), True)


test("Trie: starts_with true for the exact word", _starts_with_exact)


def _starts_with_no_match():
    t = Trie()
    t.insert("apple")
    assert_eq(t.starts_with("xyz"), False)


test("Trie: starts_with false for a non-matching prefix", _starts_with_no_match)


def _starts_with_empty_trie():
    t = Trie()
    assert_eq(t.starts_with("a"), False)


test("Trie: starts_with false on an empty trie", _starts_with_empty_trie)


def _starts_with_too_long():
    t = Trie()
    t.insert("cat")
    assert_eq(t.starts_with("catfish"), False)


test("Trie: starts_with false when prefix is longer than any word", _starts_with_too_long)


def _canonical():
    t = Trie()
    t.insert("apple")
    assert_eq(t.search("apple"), True)
    assert_eq(t.search("app"), False)
    assert_eq(t.starts_with("app"), True)
    t.insert("app")
    assert_eq(t.search("app"), True)


test("Trie: canonical interface example", _canonical)

# -- WordDictionary: literal search --


def _wd_canonical():
    d = WordDictionary()
    d.add_word("bad")
    d.add_word("dad")
    d.add_word("mad")
    assert_eq(d.search("pad"), False)
    assert_eq(d.search("bad"), True)
    assert_eq(d.search(".ad"), True)
    assert_eq(d.search("b.."), True)


test("WordDictionary: canonical example", _wd_canonical)


def _wd_before_add():
    d = WordDictionary()
    assert_eq(d.search("a"), False)
    assert_eq(d.search("."), False)


test("WordDictionary: search before any add_word is False", _wd_before_add)


def _wd_rejects_prefix():
    d = WordDictionary()
    d.add_word("badge")
    assert_eq(d.search("bad"), False)
    assert_eq(d.search("badge"), True)


test("WordDictionary: literal search rejects a prefix", _wd_rejects_prefix)

# -- WordDictionary: wildcard search --


def _all_dots():
    d = WordDictionary()
    d.add_word("bad")
    assert_eq(d.search("..."), True)
    assert_eq(d.search(".."), False)
    assert_eq(d.search("...."), False)


test("WordDictionary: all-dots pattern matches any word of that length", _all_dots)


def _dot_last_position():
    d = WordDictionary()
    d.add_word("badge")
    assert_eq(d.search("ba."), False)  # "bad" is only a prefix
    d.add_word("bad")
    assert_eq(d.search("ba."), True)


test("WordDictionary: dot in the last position still requires a word end", _dot_last_position)


def _dot_first_position():
    d = WordDictionary()
    d.add_word("dad")
    assert_eq(d.search(".ad"), True)
    assert_eq(d.search(".bd"), False)


test("WordDictionary: dot in the first position", _dot_first_position)


def _length_must_match():
    d = WordDictionary()
    d.add_word("bad")
    assert_eq(d.search("b..."), False)
    assert_eq(d.search("b."), False)


test("WordDictionary: pattern length must match word length", _length_must_match)


def _failed_branch():
    d = WordDictionary()
    d.add_word("and")  # 'a' branch dies at pattern ".nk"
    d.add_word("ink")
    assert_eq(d.search(".nk"), True)


test("WordDictionary: failed branch must not stop the search", _failed_branch)


def _mixed_dots():
    d = WordDictionary()
    d.add_word("apple")
    d.add_word("ample")
    assert_eq(d.search("a.ple"), True)
    assert_eq(d.search(".pple"), True)
    assert_eq(d.search("a..le"), True)
    assert_eq(d.search("a..lo"), False)


test("WordDictionary: mixed dots and literals", _mixed_dots)


def _single_char_dot():
    d = WordDictionary()
    d.add_word("z")
    assert_eq(d.search("."), True)
    assert_eq(d.search("z"), True)
    assert_eq(d.search("a"), False)


test("WordDictionary: single-character word and dot", _single_char_dot)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
