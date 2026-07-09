import sys
from stub import Trie, search_suggestions

passed = 0
failed = 0


def test(name: str, condition: bool, detail: str = "") -> None:
    global passed, failed
    if condition:
        print(f"  PASS: {name}")
        passed += 1
    else:
        msg = f" — {detail}" if detail else ""
        print(f"  FAIL: {name}{msg}")
        failed += 1


# Trie
t = Trie()
t.insert("apple")
test("trie: search exact word", t.search("apple") is True)
test("trie: prefix not a word", t.search("app") is False)
test("trie: starts_with valid prefix", t.starts_with("app") is True)
test("trie: starts_with full word", t.starts_with("apple") is True)
test("trie: starts_with missing prefix", t.starts_with("xyz") is False)
t.insert("app")
test("trie: search after inserting prefix", t.search("app") is True)
test("trie: apple still found", t.search("apple") is True)
test("trie: shorter prefix 'ap' not a word", t.search("ap") is False)

t2 = Trie()
t2.insert("")
test("trie: empty string insert+search", t2.search("") is True)
test("trie: empty prefix always starts_with", t2.starts_with("") is True)

t3 = Trie()
for w in ["bat", "ball", "band", "can", "cat"]:
    t3.insert(w)
test("trie: multi-word search bat", t3.search("bat") is True)
test("trie: multi-word prefix ba", t3.starts_with("ba") is True)
test("trie: multi-word search ba not word", t3.search("ba") is False)
test("trie: starts_with cap false", t3.starts_with("cap") is False)

# search_suggestions
r = search_suggestions(["mobile","mouse","moneypot","monitor","mousepad"], "mouse")
test("suggestions: prefix m", r[0] == ["mobile","moneypot","monitor"], f"got {r[0]}")
test("suggestions: prefix mo", r[1] == ["mobile","moneypot","monitor"], f"got {r[1]}")
test("suggestions: prefix mou", r[2] == ["mouse","mousepad"], f"got {r[2]}")
test("suggestions: prefix mous", r[3] == ["mouse","mousepad"], f"got {r[3]}")
test("suggestions: prefix mouse", r[4] == ["mouse","mousepad"], f"got {r[4]}")

r2 = search_suggestions(["havana"], "havana")
test("suggestions: single product", all(row == ["havana"] for row in r2), f"got {r2}")

r3 = search_suggestions(["bags","baggage","banner","box","cloths"], "bags")
test("suggestions: bags prefix b", r3[0] == ["baggage","bags","banner"], f"got {r3[0]}")
test("suggestions: bags prefix ba", r3[1] == ["baggage","bags","banner"], f"got {r3[1]}")
test("suggestions: bags prefix bag", r3[2] == ["baggage","bags"], f"got {r3[2]}")
test("suggestions: bags prefix bags", r3[3] == ["bags"], f"got {r3[3]}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
