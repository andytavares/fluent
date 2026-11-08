## What you build

You build two dictionary classes on one prefix tree: `Trie` with exact and prefix search, and `WordDictionary` with a `.` wildcard. Each lookup takes time in the word length, not in the number of stored words. This lesson builds on **Binary Tree** and **Hash Maps**.

## Key concepts

### A trie stores strings as paths of characters

A trie (prefix tree) is a tree in which each edge is one character. Each path from the root spells a prefix. A node with `isEnd` set marks the end of a complete word. All words with a common prefix share the path of that prefix, and that sharing is the whole data structure.

```java
static class TrieNode {
    // Index c - 'a' holds the child for c
    TrieNode[] children = new TrieNode[26];
    // A stored word ends exactly here
    boolean isEnd = false;
}
```

A `TrieNode[26]` array indexed by `c - 'a'` is idiomatic Java for a lowercase alphabet. A `HashMap<Character, TrieNode>` works for a larger alphabet.

### Insert, search and startsWith use one walk

`insert` walks the word from the root and creates each missing child. It sets `isEnd` on the last node.

```java
public void insert(String word) {
    TrieNode node = root;
    for (char c : word.toCharArray()) {
        int i = c - 'a';
        if (node.children[i] == null) {
            node.children[i] =
                new TrieNode();
        }
        node = node.children[i];
    }
    node.isEnd = true;
}
```

`search` and `startsWith` walk the same path but create no nodes. `search` requires `isEnd == true` on the last node. `startsWith` requires only that the path exists. Put the walk in a private `traverse(str)` helper that returns the node it reaches, or `null`.

```java
public boolean search(String word) {
    TrieNode n = traverse(word);
    return n != null && n.isEnd;
}
public boolean startsWith(String prefix) {
    return traverse(prefix) != null;
}
```

### A wildcard turns the walk into a depth-first search

A `.` matches any single letter. At a `.`, you must try every child, and the search succeeds if any branch matches the rest of the pattern. That is a depth-first search over the trie, indexed by the pattern position.

```java
// pattern is the word being searched.
boolean dfs(TrieNode node, int i) {
    if (i == pattern.length()) {
        return node.isEnd;
    }
    char c = pattern.charAt(i);
    if (c != '.') {
        TrieNode next =
            node.children[c - 'a'];
        return next != null
            && dfs(next, i + 1);
    }
    for (TrieNode child : node.children) {
        if (child != null
                && dfs(child, i + 1)) {
            return true;
        }
    }
    return false;
}
```

A pattern of only dots visits every node at that depth: O(26^d) in the worst case for `d` dots. Literal characters prune hard, so the search is fast in practice.

### One trie lets a grid search find many words at once

Word Search II asks which of `words` you can trace through adjacent cells of a letter grid. A grid search for each word repeats the same cell walks again and again. Put all the words in one trie, and walk the grid and the trie together. From each cell, move to a neighbor only if the trie has a child for its letter. One grid DFS then matches every word, and it drops a dead prefix as soon as the trie has no matching child.

### Complexity of the flagship problems

| Operation | Time | Space |
|-----------|------|-------|
| `Trie.insert(word)` | O(m) | O(m) new nodes worst case |
| `Trie.search(word)` / `startsWith(prefix)` | O(m) | O(1) |
| `WordDictionary.addWord(word)` | O(m) | O(m) |
| `WordDictionary.search(pattern)` | O(m) with no dots; O(26^d · m) worst case with `d` dots | O(m) recursion |
| Word Search II | O(Σ word lengths) build + O(rows · cols · 3^(L-1)) DFS | O(Σ word lengths) |

`m` is the word or pattern length. `L` is the length of the longest word.

## Watch out

- Without the `isEnd` check, `search` acts like `startsWith`. After only `insert("apple")`, `search("app")` must return `false`.
- The wildcard `.` must OR over all children. If you return the result of the first child, a dead branch ends the search.
- With words `bad`, `dad` and `mad`, `search(".ad")` tries `b` first. If a branch dies, it must try the next child.
- A dot in the last position still needs `isEnd`. The base case returns `node.isEnd`, not `true`.
- If the base case returns `true`, `"ba."` matches the prefix of a stored `"badge"`.
- The length must match exactly: `"b..."` does not match `"bad"`. Succeed only at `i == pattern.length()` to get this for free.
- `c - 'a'` assumes lowercase input. An uppercase letter or a digit throws `ArrayIndexOutOfBoundsException`.
- In Word Search II, mark a cell before you recurse and restore it after. Write `board[r][c] = '#'`, then put the letter back.
- In Word Search II, clear a found word at its end node. Otherwise the search reports it twice.

## Problem walkthroughs

### Implement Trie (Prefix Tree) ★

**Problem.** Build a `Trie` class over lowercase words with three operations. `insert(word)` stores a word. `search(word)` returns whether the trie holds that exact word. `startsWith(prefix)` returns whether a stored word begins with `prefix`.

**Example.**

```text
insert("apple")
search("apple")   → true
search("app")     → false
startsWith("app") → true
insert("app")
search("app")     → true
```

**Steps.**
1. The root is an empty `TrieNode`, with 26 `null` children and `isEnd = false`.
2. `insert`: walk the word one character at a time from the root. Create a child node when one is missing. Set `isEnd = true` on the last node.
3. Write `traverse(str)`: follow existing children only. Return `null` as soon as a character has no child; otherwise return the last node.
4. `search(word)` is true when `traverse(word)` reaches a node and that node has `isEnd` set. `startsWith(prefix)` is true when `traverse(prefix)` reaches a node.
5. The invariant: a node exists exactly when an inserted word passes through its prefix. `isEnd` is true exactly when an inserted word ends there.

**Complexity.** O(m) time per operation / O(m) new nodes per insert in the worst case. The cost does not depend on the number of stored words.

### Design Add and Search Words Data Structure ★

**Problem.** Build a `WordDictionary` class. `addWord(word)` stores a lowercase word. `search(pattern)` returns whether a stored word matches `pattern`. A `.` matches exactly one letter, and each other character matches only itself. The whole pattern must match a whole word of the same length.

**Example.**

```text
addWord("bad")
addWord("dad")
addWord("mad")
search("pad") → false
search("bad") → true
search(".ad") → true
search("b..") → true
```

**Steps.**
1. Reuse the trie node. `addWord` is `Trie.insert`.
2. `search` is a recursive DFS, `dfs(node, i)`, over the pattern index `i`.
3. Base case: at `i == pattern.length()`, return `node.isEnd`. The search used the full pattern and must stop at a word end.
4. Literal character: go down into `children[c - 'a']` if it exists. Otherwise return `false`.
5. Dot: loop over all non-null children. Return `true` as soon as a branch matches the rest of the pattern. Return `false` if none do.
6. Recurse by index, not with `substring`, so each frame is O(1).

**Complexity.** O(m) time for patterns with no dots; O(26^d · m) in the worst case with `d` dots / O(m) recursion depth.

### Word Search II

**Problem.** Given an `m × n` grid of letters and a list `words`, return every word you can trace through adjacent cells. Adjacent means up, down, left or right. Each cell can appear at most once in a word.

**Example.**

```text
board = [['o','a','a','n'],
         ['e','t','a','e'],
         ['i','h','k','r'],
         ['i','f','l','v']]
words = ["oath","pea","eat","rain"]
→ ["oath","eat"]
```

**Steps.**
1. Build a trie of all `words`. At the last node of each word, store the full word (`node.word = word`) in place of a boolean. The DFS then emits results without tracking the path.
2. From every cell, start a DFS that carries the current trie node. Recurse into a neighbor only when the trie node has a child for the letter of that neighbor. This pruning makes the multi-word search cheap.
3. When you enter a cell whose trie node has a non-null `node.word`, add the word to the results. Set `node.word = null` so that the search never reports it twice.
4. Mark the cell in place before you recurse (`board[r][c] = '#'`), and restore it after. The `#` never matches a trie child, so the DFS cannot revisit the cell.
5. Optional but effective: after you explore a child, delete it from its parent if it has no children and no word. The trie shrinks as you find words, which prunes later searches.

**Complexity.** O(Σ word lengths) to build the trie + O(m · n · 3^(L-1)) for the DFS / O(Σ word lengths) space. `L` is the longest word length. The base is 3 because the walk never goes back the way it came.

## Interview follow-ups

After Implement Trie:
- "Implement `delete(word)`." Clear `isEnd` at the last node. Then walk back up and remove each node that has no children and no `isEnd`. Keep a parent stack, or recurse.
- "Count words with a given prefix in O(m)?" Store a `passCount` on every node, and add 1 to it on each insert. The answer is the count at the prefix node.
- "Trie or hash set?" A set also answers exact membership in O(m), but it cannot answer prefix queries. A trie also shares storage between words with common prefixes.

After Add and Search Words:
- "What is the worst-case pattern?" All dots: the search visits every node at depth `m`. To reduce the cost, also group the words by length, and filter by length first.
- "Support `*` (zero or more characters)?" The DFS gets a new branch case. It either consumes the star or consumes one trie edge. This is wildcard matching over the trie.

After Word Search II:
- "Why a trie, and not Word Search once per word?" A search per word repeats the same grid walks for shared prefixes. The trie walks each shared prefix once and prunes dead branches at once.

## The task

Build two dictionary classes on the same prefix-tree core, as static nested classes of `Solution`. Words and patterns are non-empty strings of lowercase letters `a–z`. Patterns can also contain `.`.

1. `new Trie()` creates an empty trie.
2. `void insert(String word)` stores `word`. Inserting the same word twice has no extra effect.
3. `boolean search(String word)` returns `true` if you inserted `word` before. Otherwise it returns `false`.
4. A prefix of an inserted word does not count for `search`.
5. `boolean startsWith(String prefix)` returns `true` if at least one inserted word begins with `prefix`.
6. An inserted word counts as a prefix of itself.
7. `new WordDictionary()` creates an empty dictionary.
8. `void addWord(String word)` stores `word`. The word has lowercase letters only, with no dots.
9. `boolean search(String pattern)` returns `true` if a stored word matches `pattern`.
10. In a pattern, `.` matches exactly one letter. Each other character matches only itself.
11. The match must cover the whole word. The pattern and the word must have the same length.

Edge cases:

- A search on an empty `Trie` or `WordDictionary` returns `false`.
- A query longer than every stored word returns `false` for `search` and for `startsWith`.
- Words with a common prefix are all found. Single-character words work.
- A pattern of only dots matches any stored word of that length.
- A dot in the last position must still end on a complete word, not on a prefix.
- A pattern with no dots acts as an exact lookup.
- A failed branch at a dot must not stop the search. The search tries the next child.

```java
Trie t = new Trie();
t.insert("apple");
t.search("apple");   // true
// "app" itself is not inserted
t.search("app");     // false
// "apple" begins with "app"
t.startsWith("app"); // true
t.insert("app");
t.search("app");     // true

Trie c = new Trie();
c.insert("cat");
c.search("catfish");     // false
c.startsWith("catfish"); // false

WordDictionary d =
    new WordDictionary();
d.addWord("bad");
d.addWord("dad");
d.addWord("mad");
d.search("pad"); // false
d.search("bad"); // true
// "bad", "dad" and "mad" match
d.search(".ad"); // true
d.search("b.."); // true
// No stored 4-letter word
d.search("b..."); // false

WordDictionary e =
    new WordDictionary();
e.addWord("badge");
// "bad" is only a prefix
e.search("ba.");  // false
e.addWord("bad");
e.search("ba.");  // true
```
