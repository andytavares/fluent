import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    static class Trie {
        private static class TrieNode {
            TrieNode[] children = new TrieNode[26];
            boolean isEnd = false;
        }

        private final TrieNode root = new TrieNode();

        public Trie() {}

        public void insert(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                int idx = c - 'a';
                if (node.children[idx] == null) node.children[idx] = new TrieNode();
                node = node.children[idx];
            }
            node.isEnd = true;
        }

        public boolean search(String word) {
            TrieNode node = traverse(word);
            return node != null && node.isEnd;
        }

        public boolean startsWith(String prefix) {
            return traverse(prefix) != null;
        }

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

    public static List<List<String>> searchSuggestions(String[] products, String searchWord) {
        Arrays.sort(products);
        var result = new ArrayList<List<String>>();
        int lo = 0, hi = products.length - 1;

        for (int i = 0; i < searchWord.length(); i++) {
            char c = searchWord.charAt(i);
            while (lo <= hi && (products[lo].length() <= i || products[lo].charAt(i) < c)) lo++;
            while (lo <= hi && (products[hi].length() <= i || products[hi].charAt(i) > c)) hi--;

            var matches = new ArrayList<String>();
            int limit = Math.min(lo + 2, hi);
            for (int j = lo; j <= limit; j++) matches.add(products[j]);
            result.add(matches);
        }
        return result;
    }

    public static void main(String[] args) {
        var trie = new Trie();
        trie.insert("apple");
        System.out.println(trie.search("apple"));    // true
        System.out.println(trie.search("app"));      // false
        System.out.println(trie.startsWith("app"));  // true
        trie.insert("app");
        System.out.println(trie.search("app"));      // true

        System.out.println(searchSuggestions(
            new String[]{"mobile","mouse","moneypot","monitor","mousepad"}, "mouse"));
    }
}
