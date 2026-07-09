class Solution {

    // Shared node shape: 26 children slots (a-z) plus an end-of-word flag.
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd = false;
    }

    // Trie: a prefix tree over lowercase a-z words.
    static class Trie {
        private final TrieNode root = new TrieNode();

        public Trie() {}

        // Stores a word, creating nodes on demand. O(m) time.
        public void insert(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                int idx = c - 'a';
                if (node.children[idx] == null) node.children[idx] = new TrieNode();
                node = node.children[idx];
            }
            node.isEnd = true;
        }

        // Exact-word membership: the path must exist AND end on an isEnd
        // node. O(m) time.
        public boolean search(String word) {
            TrieNode node = traverse(word);
            return node != null && node.isEnd;
        }

        // Prefix membership: the path just has to exist. O(m) time.
        public boolean startsWith(String prefix) {
            return traverse(prefix) != null;
        }

        // Walks the path spelled by s through existing children only.
        private TrieNode traverse(String s) {
            TrieNode node = root;
            for (char c : s.toCharArray()) {
                int idx = c - 'a';
                if (node.children[idx] == null) return null;
                node = node.children[idx];
            }
            return node;
        }
    }

    // WordDictionary: stores lowercase words and supports "." wildcard search
    // where "." matches exactly one arbitrary letter.
    static class WordDictionary {
        private final TrieNode root = new TrieNode();

        public WordDictionary() {}

        // Stores a word — same walk as Trie.insert. O(m) time.
        public void addWord(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                int idx = c - 'a';
                if (node.children[idx] == null) node.children[idx] = new TrieNode();
                node = node.children[idx];
            }
            node.isEnd = true;
        }

        // Wildcard lookup: "." matches any single letter, so it forks the
        // walk into a DFS that ORs over every child. Recursing by pattern
        // index keeps each frame O(1). O(m) without dots, O(26^d * m) worst
        // case with d dots.
        public boolean search(String pattern) {
            return dfs(root, pattern, 0);
        }

        private boolean dfs(TrieNode node, String pattern, int i) {
            if (i == pattern.length()) return node.isEnd;
            char ch = pattern.charAt(i);
            if (ch != '.') {
                int idx = ch - 'a';
                return node.children[idx] != null && dfs(node.children[idx], pattern, i + 1);
            }
            for (TrieNode child : node.children) {
                if (child != null && dfs(child, pattern, i + 1)) return true;
            }
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
