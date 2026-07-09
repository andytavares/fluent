class Solution {

    // Trie: a prefix tree over lowercase a-z words.
    static class Trie {

        public Trie() {
            // TODO: initialize the root node
        }

        // Stores a word in the trie. Inserting the same word twice is harmless.
        public void insert(String word) {
            // TODO: walk from the root, creating child nodes on demand;
            // set isEnd = true on the final node
        }

        // Returns true if the exact word was previously inserted. A prefix
        // of an inserted word does not count.
        public boolean search(String word) {
            // TODO: follow existing children only; false if a char is
            // missing OR the final node's isEnd is false
            return false;
        }

        // Returns true if at least one inserted word begins with prefix.
        public boolean startsWith(String prefix) {
            // TODO: same walk as search, but no isEnd check
            return false;
        }
    }

    // WordDictionary: stores lowercase words and supports "." wildcard search
    // where "." matches exactly one arbitrary letter.
    static class WordDictionary {

        public WordDictionary() {
            // TODO: initialize the root node
        }

        // Stores a word (lowercase letters, no dots).
        public void addWord(String word) {
            // TODO: identical to Trie.insert
        }

        // Returns true if any stored word matches pattern, where "." matches
        // exactly one arbitrary letter. Pattern and word lengths must match.
        public boolean search(String pattern) {
            // TODO: recursive dfs(node, i) over the pattern index —
            // base case i == pattern.length() -> node.isEnd;
            // literal char -> descend into that child (false if missing);
            // "." -> try every child, true if ANY branch matches the rest
            return false;
        }
    }

    public static void main(String[] args) {
        Trie t = new Trie();
        t.insert("apple");
        System.out.println(t.search("apple"));   // true
        System.out.println(t.search("app"));     // false
        System.out.println(t.startsWith("app")); // true
        t.insert("app");
        System.out.println(t.search("app"));     // true

        WordDictionary d = new WordDictionary();
        d.addWord("bad");
        d.addWord("dad");
        d.addWord("mad");
        System.out.println(d.search("pad")); // false
        System.out.println(d.search("bad")); // true
        System.out.println(d.search(".ad")); // true
        System.out.println(d.search("b..")); // true
    }
}
