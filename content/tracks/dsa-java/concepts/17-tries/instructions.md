# Tries

## What you'll learn

How a prefix tree gives O(L) insert and prefix-lookup (independent of word count), and how to apply it to the search-suggestions problem — an exact replica of the Amazon/Google autocomplete question.

## Key concepts

### The Trie data structure

Each node holds an array of 26 children (one per lowercase letter) and an `isEnd` flag.

```java
static class Trie {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd = false;
    }

    private final TrieNode root = new TrieNode();

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
```

### Search Suggestions

For each prefix of `searchWord`, return the 3 lexicographically smallest products from `products` that start with that prefix. Sort products first; then for each prefix, scan from the sorted position to collect at most 3 matches.

```java
public static List<List<String>> searchSuggestions(String[] products, String searchWord) {
    Arrays.sort(products);
    var result = new ArrayList<List<String>>();

    // Build a trie for prefix navigation
    var trie = new Trie();
    for (String p : products) trie.insert(p);

    // Alternatively: binary search on sorted array (simpler, same complexity)
    for (int i = 1; i <= searchWord.length(); i++) {
        String prefix = searchWord.substring(0, i);
        var matches = new ArrayList<String>();
        collectWords(trie.root, new StringBuilder(prefix), matches);
        // The DFS below starts from the prefix node, not root
        result.add(matches);
    }
    return result;
}
```

In practice, the sorted-array binary search approach is cleaner and equally correct:

```java
public static List<List<String>> searchSuggestions(String[] products, String searchWord) {
    Arrays.sort(products);
    var result = new ArrayList<List<String>>();
    int lo = 0, hi = products.length - 1;

    for (int i = 0; i < searchWord.length(); i++) {
        char c = searchWord.charAt(i);
        // Advance lo until products[lo] has prefix match at position i
        while (lo <= hi && (products[lo].length() <= i || products[lo].charAt(i) < c)) lo++;
        // Retreat hi until products[hi] has prefix match at position i
        while (lo <= hi && (products[hi].length() <= i || products[hi].charAt(i) > c)) hi--;

        var matches = new ArrayList<String>();
        for (int j = lo; j <= Math.min(lo + 2, hi); j++) matches.add(products[j]);
        result.add(matches);
    }
    return result;
}
```

## Time and space complexity

| Operation | Time | Space | Why |
|-----------|------|-------|-----|
| `Trie.insert` | O(L) | O(L) per word | One node per character, shared for common prefixes |
| `Trie.search` | O(L) | O(1) | Walk L nodes |
| `Trie.startsWith` | O(L) | O(1) | Same walk |
| `searchSuggestions` | O(n log n + S·n) | O(n·L) | n = products, S = searchWord length |

## Common variations this pattern solves

1. **Word Search II** — build trie from words; DFS grid using trie to prune early
2. **Replace Words** — find shortest root in trie for each word in sentence
3. **Design Search Autocomplete System** — trie with frequency counts; DFS for top-k
4. **Longest Word in Dictionary** — BFS/DFS trie; longest word where all prefixes exist

## vs HashMap

`HashSet.contains(word)` is O(L) for search, same as a trie. But `startsWith` on a HashSet requires scanning all words — O(n·L). The trie answers prefix queries in O(L) regardless of word count. That's the fundamental reason to choose a trie.

## Watch out

- **`char - 'a'` maps 'a'→0, 'z'→25**: this only works for lowercase ASCII. For mixed case or Unicode, use `HashMap<Character, TrieNode>` as the children container.
- **`isEnd` vs presence in children**: a word is fully stored only when `isEnd == true` at its last character node. A node can exist (prefix exists) without `isEnd` (full word not inserted).
- **`TrieNode[]` children default to null**: no initialization loop needed. `new TrieNode[26]` fills all 26 slots with `null` automatically.
- **searchSuggestions: prefix boundaries**: when no word in the range matches the next character, `lo > hi`. The result is an empty list for that prefix — not an error.

## FAANG follow-up questions

> "What's the space complexity if all words share a common prefix?" — O(L_max + n · unique_suffix_length). Best case: all words share the full prefix except the last character — nearly O(total_characters).
>
> "How would you implement autocomplete with frequency ranking (most popular first)?" — Store a `PriorityQueue<String>` at each trie node (or run a DFS and sort). Common in system design questions.
>
> "Can you handle wildcards (`.` matches any character) in search?" — Walk all 26 children when the pattern character is `.`. O(26^wildcards · L) in the worst case.
>
> "What's the tradeoff between trie and sorted array + binary search for searchSuggestions?" — Trie: O(S·n) after O(n·L) build, supports true prefix API. Sorted array: O(n log n) sort + O(S·log n) binary search; no prefix API but simpler code. Both acceptable in interviews.

## The task

Implement `Trie` as a static inner class and `searchSuggestions` as a static method in `Solution`:

```java
static class Trie {
    public Trie()
    public void insert(String word)           // insert word (lowercase letters only)
    public boolean search(String word)        // true if exact word exists
    public boolean startsWith(String prefix)  // true if any word starts with prefix
}

// For each prefix of searchWord (length 1 to searchWord.length()),
// returns the 3 lexicographically smallest products starting with that prefix.
// products contains no duplicates; all lowercase.
// products=["mobile","mouse","moneypot","monitor","mousepad"], searchWord="mouse"
// -> [["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],
//     ["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]
public static List<List<String>> searchSuggestions(String[] products, String searchWord)
```
