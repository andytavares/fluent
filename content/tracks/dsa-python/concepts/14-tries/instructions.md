# Tries

## What you'll learn

How a trie (prefix tree) enables O(L) insert, exact search, and prefix search — something a hash set can't do — and how the `search_suggestions` problem combines trie construction with DFS to simulate autocomplete.

## Key concepts

A trie node stores a mapping from character to child node, plus an `is_end` flag marking whether this node terminates a valid word.

```python
class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.is_end: bool = False
```

### Trie — insert, search, starts_with

```python
class Trie:
    def __init__(self) -> None:
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True           # mark end of this word

    def search(self, word: str) -> bool:
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end           # must be an exact word, not just a prefix

    def starts_with(self, prefix: str) -> bool:
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True                  # prefix exists; words may or may not end here
```

### Search Suggestions — trie + DFS for autocomplete

Build a trie from the sorted product list, then for each prefix of `search_word`, collect the first 3 lexicographic suggestions.

```python
def search_suggestions(products: list[str], search_word: str) -> list[list[str]]:
    # Build trie
    trie = Trie()
    for product in sorted(products):   # sort so DFS finds words in order
        trie.insert(product)

    def dfs_collect(node: TrieNode, prefix: str, results: list[str]) -> None:
        if len(results) == 3:
            return
        if node.is_end:
            results.append(prefix)
        for ch in sorted(node.children):  # alphabetical order
            dfs_collect(node.children[ch], prefix + ch, results)

    result: list[list[str]] = []
    node = trie.root
    for i, ch in enumerate(search_word):
        if ch not in node.children:
            # No word starts with this prefix; remaining prefixes also empty
            result.extend([[] for _ in range(len(search_word) - i)])
            break
        node = node.children[ch]
        suggestions: list[str] = []
        dfs_collect(node, search_word[:i + 1], suggestions)
        result.append(suggestions)

    return result
```

**Alternative:** sort products first, then for each prefix use `bisect_left` to find the start and collect the next 3 words that still match. O(n log n + m · 26) total.

## Time and space complexity

| Operation | Time | Space |
|-----------|------|-------|
| insert(word of length L) | O(L) | O(L) new nodes |
| search(word of length L) | O(L) | O(1) |
| starts_with(prefix P) | O(\|P\|) | O(1) |
| search_suggestions (n products, word length m) | O(n·L + m·26) | O(n·L) |

## Common variations

- **Word Search II** — backtrack on a grid, using a trie to check whether the current path is a prefix of any target word; prune when the current prefix isn't in the trie
- **Add and Search Word** — `search` supports `.` wildcard; DFS through all children at wildcard positions
- **Longest Word in Dictionary** — find the longest word built one letter at a time; BFS on the trie

## vs other languages

Python's `dict` for `children` is idiomatic — general and memory-efficient for sparse tries (not all 26 letters at every node). A fixed-size `list[Optional[TrieNode]]` of 26 slots is faster (O(1) access vs O(1) average hash) but wastes space and only works for lowercase ASCII. C++ `unordered_map` is equivalent to Python's `dict`. Java uses `HashMap<Character, TrieNode>`.

## Watch out

- **`search` vs `starts_with`:** `search` requires `node.is_end = True`; `starts_with` just needs to reach the end of the prefix without returning `False`. The difference matters: "app" is a prefix of "apple" but not a word in the trie if you only inserted "apple".
- **`defaultdict(TrieNode)` does not work** — accessing a missing key would auto-create a `TrieNode`, which is correct for building but wrong for searching (you'd never return `False` for a missing character). Use plain `dict` and `if ch not in node.children`.
- **`search_suggestions` with `break` on missing prefix:** if `search_word[i]` is not a child, no words can match any longer prefix. Pad with empty lists for the remaining characters.
- **DFS in `dfs_collect` must be sorted** — `for ch in sorted(node.children)` — otherwise results won't be lexicographic.

## FAANG follow-up questions

> "What's the space complexity of a trie vs a hash set for n words of average length L?" — Trie: O(n·L) nodes in the worst case (all words share no prefixes). Hash set: O(n·L) total characters. Similar asymptotically; trie is worse with constant factor due to per-node overhead.

> "How would you implement `delete` in a trie?" — Set `is_end = False` for the word's last node. Optionally prune leaf nodes with no other words. Pruning is tricky; most interview questions don't ask for it.

> "If `search_suggestions` needs the top 3 most popular products (not lexicographic), how would you change the trie?" — Store a sorted list of top-k words at each node, updating it on every insert. This makes search O(L) but insert O(L · k).

## The task

```python
class Trie:
    """Prefix tree supporting insert, exact search, and prefix search."""
    def __init__(self) -> None: ...
    def insert(self, word: str) -> None:
        """Insert word into the trie."""
    def search(self, word: str) -> bool:
        """Return True if word exists exactly in the trie."""
    def starts_with(self, prefix: str) -> bool:
        """Return True if any inserted word starts with prefix."""

def search_suggestions(products: list[str], search_word: str) -> list[list[str]]:
    """For each prefix of search_word (from length 1 to len(search_word)),
    return up to 3 lexicographically smallest product names that share that prefix.
    Return a list of lists, one per prefix."""
```

**Examples:**
```python
t = Trie()
t.insert("apple"); t.search("apple")  # True
t.search("app")                        # False
t.starts_with("app")                   # True
```

- `search_suggestions(["mobile","mouse","moneypot","monitor","mousepad"], "mouse")` →
  `[["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]`
- `search_suggestions(["havana"], "havana")` →
  `[["havana"],["havana"],["havana"],["havana"],["havana"],["havana"]]`
