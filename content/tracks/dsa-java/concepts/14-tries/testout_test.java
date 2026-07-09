import java.util.ArrayList;
import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // Trie: insert + search (exact match)
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("apple");
            check("Trie: search finds an inserted word", t.search("apple"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("apple");
            check("Trie: search rejects a prefix of an inserted word", !t.search("app"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("apple");
            check("Trie: search rejects a word never inserted", !t.search("banana"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("apple");
            t.insert("app");
            check("Trie: search finds a prefix once it is inserted itself", t.search("app"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("a");
            check("Trie: single-character word", t.search("a") && !t.search("ab"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("cat");
            check("Trie: query longer than every stored word", !t.search("catfish"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            for (String w : new String[]{"car", "card", "care", "careful"}) t.insert(w);
            check("Trie: words sharing a prefix are all found",
                  t.search("car") && t.search("card") && t.search("careful")
                  && !t.search("ca") && !t.search("cards"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("dog");
            t.insert("dog");
            check("Trie: inserting the same word twice is harmless",
                  t.search("dog") && !t.search("do"));
        }

        // Trie: startsWith
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("apple");
            check("Trie: startsWith true for a proper prefix", t.startsWith("app"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("apple");
            check("Trie: startsWith true for the exact word", t.startsWith("apple"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("apple");
            check("Trie: startsWith false for a non-matching prefix", !t.startsWith("xyz"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            check("Trie: startsWith false on an empty trie", !t.startsWith("a"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("cat");
            check("Trie: startsWith false when prefix is longer than any word", !t.startsWith("catfish"));
        }
        {
            Solution.Trie t = new Solution.Trie();
            t.insert("apple");
            boolean ok = t.search("apple") && !t.search("app") && t.startsWith("app");
            t.insert("app");
            ok = ok && t.search("app");
            check("Trie: canonical interface example", ok);
        }
        {
            Solution.Trie t = new Solution.Trie();
            List<String> words = new ArrayList<>();
            long x = 1;
            for (int i = 0; i < 1000; i++) {
                StringBuilder w = new StringBuilder();
                int len = 3 + (i % 5);
                for (int j = 0; j < len; j++) {
                    x = (x * 48271) % 2147483647;
                    w.append((char) ('a' + (x % 26)));
                }
                words.add(w.toString());
                t.insert(w.toString());
            }
            boolean ok = true;
            for (String w : words) {
                if (!t.search(w)) ok = false;
                if (!t.startsWith(w.substring(0, 2))) ok = false;
                if (t.search(w + "aaaaaaaa")) ok = false;
            }
            check("Trie: 1000 generated words, exact hits and near misses", ok);
        }
        {
            Solution.Trie t = new Solution.Trie();
            String longWord = "ab".repeat(100);
            t.insert(longWord);
            check("Trie: deep word (length 200)",
                  t.search(longWord)
                  && !t.search(longWord.substring(0, 199))
                  && t.startsWith(longWord.substring(0, 199)));
        }

        // WordDictionary: literal search
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            d.addWord("bad");
            d.addWord("dad");
            d.addWord("mad");
            check("WordDictionary: canonical example",
                  !d.search("pad") && d.search("bad") && d.search(".ad") && d.search("b.."));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            check("WordDictionary: search before any addWord is false",
                  !d.search("a") && !d.search("."));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            d.addWord("badge");
            check("WordDictionary: literal search rejects a prefix",
                  !d.search("bad") && d.search("badge"));
        }

        // WordDictionary: wildcard search
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            d.addWord("bad");
            check("WordDictionary: all-dots pattern matches any word of that length",
                  d.search("...") && !d.search("..") && !d.search("...."));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            d.addWord("badge");
            boolean before = !d.search("ba.");
            d.addWord("bad");
            check("WordDictionary: dot in the last position still requires a word end",
                  before && d.search("ba."));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            d.addWord("dad");
            check("WordDictionary: dot in the first position",
                  d.search(".ad") && !d.search(".bd"));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            d.addWord("bad");
            check("WordDictionary: pattern length must match word length",
                  !d.search("b...") && !d.search("b."));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            d.addWord("and");
            d.addWord("ink");
            check("WordDictionary: failed branch must not stop the search", d.search(".nk"));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            d.addWord("apple");
            d.addWord("ample");
            check("WordDictionary: mixed dots and literals",
                  d.search("a.ple") && d.search(".pple") && d.search("a..le") && !d.search("a..lo"));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            d.addWord("z");
            check("WordDictionary: single-character word and dot",
                  d.search(".") && d.search("z") && !d.search("a"));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            String alphabet = "abcdefghijklmnopqrstuvwxy"; // no z
            for (char a : alphabet.toCharArray()) {
                for (char b : alphabet.toCharArray()) {
                    d.addWord("" + a + b + "k");
                }
            }
            d.addWord("zzq");
            check("WordDictionary: adversarial — many words, only the last branch matches",
                  d.search("..q") && d.search("..k") && !d.search("..x"));
        }
        {
            Solution.WordDictionary d = new Solution.WordDictionary();
            for (String w : new String[]{"abcde", "abfde", "xbcdy"}) d.addWord(w);
            check("WordDictionary: dots interleaved across shared prefixes",
                  d.search("ab.de") && d.search(".bcd.") && d.search(".b.d.")
                  && !d.search(".b.dz") && d.search("a...e") && !d.search("x...e"));
        }

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
