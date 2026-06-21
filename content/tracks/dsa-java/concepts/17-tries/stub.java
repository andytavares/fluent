import java.util.ArrayList;
import java.util.List;

class Solution {

    static class Trie {

        public Trie() {
            // TODO
        }

        public void insert(String word) {
            // TODO
        }

        public boolean search(String word) {
            // TODO
            return false;
        }

        public boolean startsWith(String prefix) {
            // TODO
            return false;
        }
    }

    public static List<List<String>> searchSuggestions(String[] products, String searchWord) {
        // TODO
        return new ArrayList<>();
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
