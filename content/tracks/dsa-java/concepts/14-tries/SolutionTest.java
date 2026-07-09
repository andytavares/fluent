import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // Trie — basic operations
        var t1 = new Solution.Trie();
        t1.insert("apple");
        check("search: 'apple' after insert",      t1.search("apple"));
        check("search: 'app' not found (prefix)",  !t1.search("app"));
        check("startsWith: 'app' is a prefix",     t1.startsWith("app"));
        check("not startsWith: 'b'",               !t1.startsWith("b"));

        t1.insert("app");
        check("search: 'app' found after insert",  t1.search("app"));
        check("search: 'apple' still found",       t1.search("apple"));
        check("startsWith: 'appl' is a prefix",    t1.startsWith("appl"));

        // Multiple words
        var t2 = new Solution.Trie();
        t2.insert("cat"); t2.insert("car"); t2.insert("card");
        check("search: 'cat'",         t2.search("cat"));
        check("search: 'car'",         t2.search("car"));
        check("search: 'card'",        t2.search("card"));
        check("not search: 'ca'",     !t2.search("ca"));
        check("startsWith: 'ca'",      t2.startsWith("ca"));
        check("not startsWith: 'dog'", !t2.startsWith("dog"));

        // Edge cases
        var t3 = new Solution.Trie();
        t3.insert("a");
        check("single char search",    t3.search("a"));
        check("not search: 'ab'",     !t3.search("ab"));

        var t4 = new Solution.Trie();
        check("empty trie search",    !t4.search("any"));
        check("empty trie startsWith",!t4.startsWith("a"));

        // searchSuggestions
        List<List<String>> ss1 = Solution.searchSuggestions(
            new String[]{"mobile","mouse","moneypot","monitor","mousepad"}, "mouse");
        check("ss: 5 prefixes -> 5 lists", ss1.size() == 5);
        check("ss: prefix 'mo' -> [mobile,moneypot,monitor]",
              ss1.get(1).equals(List.of("mobile","moneypot","monitor")));
        check("ss: prefix 'mou' -> [mouse,mousepad]",
              ss1.get(2).equals(List.of("mouse","mousepad")));
        check("ss: prefix 'mouse' -> [mouse,mousepad]",
              ss1.get(4).equals(List.of("mouse","mousepad")));

        List<List<String>> ss2 = Solution.searchSuggestions(
            new String[]{"havana"}, "havana");
        check("ss: single product full match",
              ss2.get(5).equals(List.of("havana")));

        List<List<String>> ss3 = Solution.searchSuggestions(
            new String[]{"bags","baggage","banner","box","cloths"}, "bags");
        check("ss: prefix 'b' -> 3 results (bags,baggage,banner)",
              ss3.get(0).size() == 3);
        check("ss: prefix 'bag' -> [baggage,bags]",
              ss3.get(2).equals(List.of("baggage","bags")));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
