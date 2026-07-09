# Trie

## What you'll learn

Building on the tree-DFS recursion from Binary Tree and the key-lookup habits from Hash Maps, this concept covers the trie (prefix tree): a character-per-edge tree that makes insert, exact search, and prefix search all O(m) in the word length — independent of how many words are stored. You'll implement the classic `Trie`, extend it with a `.` wildcard (which turns lookup into a small backtracking search), and see how a trie turns the brute-force Word Search II grid problem tractable.

## Key concepts

A trie stores a set of strings as a tree where each edge is one character. Every root-to-node path spells a prefix; nodes flagged `is_end` mark where a complete word ends. All words sharing a prefix share that prefix's path — that sharing is the whole data structure.

### The node

```python
class TrieNode:
    def __init__(self):
        self.children = {}   # char -> TrieNode
        self.is_end = False  # a stored word ends exactly here
```

A plain `dict` as the children map is idiomatic Python — no `ord(ch) - ord('a')` index arithmetic needed.

### Insert, search, starts_with — one traversal, three verdicts

```python
def insert(self, word):
    node = self.root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = TrieNode()
        node = node.children[ch]
    node.is_end = True
```

`search` and `starts_with` walk the same path without creating nodes. The only difference: `search` demands the final node has `is_end == True`; `starts_with` just demands the path exists. Factor the walk into a `_traverse(s)` helper that returns the reached node or `None`.

```python
def search(self, word):
    node = self._traverse(word)
    return node is not None and node.is_end

def starts_with(self, prefix):
    return self._traverse(prefix) is not None
```

### Wildcard lookup — a fork in the walk

Add a `.` character that matches any single letter and the walk stops being a straight line: at a `.` you must try **every** child and succeed if any branch matches the rest of the pattern. That's a depth-first search over the trie, indexed by pattern position:

```python
def dfs(node, i):
    if i == len(pattern):
        return node.is_end
    ch = pattern[i]
    if ch != ".":
        return ch in node.children and dfs(node.children[ch], i + 1)
    return any(dfs(child, i + 1) for child in node.children.values())
```

A pattern of all dots degrades to visiting every node at that depth — worst case O(26^d) for `d` dots — but concrete characters prune hard, which is why this is fast in practice.

### Trie + grid DFS — searching for many words at once

Word Search II asks: which of `words` can be traced through adjacent cells of a letter grid? Searching the grid once *per word* repeats the same cell walks over and over. Instead, put all the words in one trie and walk the grid and the trie **together**: from each cell, only descend into a neighbor if the trie has a child for that letter. One grid DFS now matches every word simultaneously, and dead prefixes are pruned the moment the trie has no matching child.

### Complexity of the flagship problems

| Operation | Time | Space |
|-----------|------|-------|
| `Trie.insert(word)` | O(m) | O(m) new nodes worst case |
| `Trie.search(word)` / `starts_with(prefix)` | O(m) | O(1) |
| `WordDictionary.add_word(word)` | O(m) | O(m) |
| `WordDictionary.search(pattern)` | O(m) no dots; O(26^d · m) worst case with `d` dots | O(m) recursion |
| Word Search II | O(Σ word lengths) build + O(rows · cols · 3^(L-1)) DFS | O(Σ word lengths) |

`m` = word/pattern length, `L` = longest word.

## Watch out

- **`search` vs `starts_with`**: forgetting the `is_end` check makes `search` behave like `starts_with` — `search("app")` must be `False` after only `insert("apple")`.
- **Wildcard `.` must OR over all children.** Returning the result of the first child (instead of continuing when it fails) is the classic bug: `search(".ad")` with words `bad`/`dad`/`mad` has to try `b`, and keep going if a branch dies. Python's `any(...)` generator expression does this correctly and short-circuits on the first `True`.
- **A dot at the last position still needs `is_end`.** The base case is `i == len(pattern) -> node.is_end`, not `True` — otherwise `"b.."` would match a stored `"badge"` prefix.
- **Length must match exactly**: `"b..."` does not match `"bad"`. The base case handles this automatically if you only succeed at `i == len(pattern)`.
- **Recursion depth is the pattern length**, which is usually small — but if you're chaining this on very long strings, remember Python's default recursion limit (~1000 frames) is much lower than JVM/V8's.
- **Word Search II bookkeeping**: mark a cell before recursing and restore it after (`board[r][c] = "#"` then put the letter back), and null out a word at its end node once found so it isn't reported twice.

## Problem walkthroughs

### Implement Trie (Prefix Tree) ★

**Problem.** Build a `Trie` class over lowercase words with three operations: `insert(word)` stores a word; `search(word)` returns whether that exact word was stored; `starts_with(prefix)` returns whether any stored word begins with `prefix`.

**Example.**

    insert("apple"); search("apple") -> True; search("app") -> False;
    starts_with("app") -> True; insert("app"); search("app") -> True

**Steps.**
1. Root is an empty `TrieNode` (`children: {}`, `is_end: False`).
2. `insert`: walk character by character from the root, creating a child node whenever one is missing; set `is_end = True` on the final node.
3. Write `_traverse(s)`: follow existing children only; return `None` the moment a character has no child, otherwise the final node.
4. `search(word)` = `_traverse(word)` reached a node **and** that node's `is_end` is true. `starts_with(prefix)` = `_traverse(prefix)` reached a node, period.
5. The invariant: a node exists exactly when some inserted word passes through that prefix, and `is_end` is true exactly when some inserted word ends there.

**Complexity.** O(m) time per operation / O(m) new nodes per insert worst case — no dependence on the number of stored words.

### Design Add and Search Words Data Structure ★

**Problem.** Build a `WordDictionary` class: `add_word(word)` stores a lowercase word; `search(pattern)` returns whether any stored word matches `pattern`, where `.` in the pattern matches exactly one arbitrary letter and every other character must match literally. The whole pattern must match a whole word (same length).

**Example.**

    add_word("bad"); add_word("dad"); add_word("mad")
    search("pad") -> False;  search("bad") -> True
    search(".ad") -> True;   search("b..") -> True

**Steps.**
1. Reuse the trie node and `add_word` = `Trie.insert`.
2. `search` is a recursive DFS `dfs(node, i)` over pattern index `i`.
3. Base case: `i == len(pattern)` → return `node.is_end` (full pattern consumed exactly at a word end).
4. Literal character: descend into `children[ch]` if it exists, else return `False`.
5. Dot: loop over all children; return `True` as soon as any branch matches the remaining pattern; `False` if none do.
6. Recursing by index (not by slicing the pattern) keeps each frame O(1).

**Complexity.** O(m) time for dot-free patterns; worst case O(26^d · m) with `d` dots / O(m) recursion depth.

### Word Search II

**Problem.** Given an `m × n` grid of letters and a list `words`, return every word that can be formed by tracing adjacent cells (up/down/left/right), using each cell at most once per word.

**Example.**

    board = [["o","a","a","n"],
             ["e","t","a","e"],
             ["i","h","k","r"],
             ["i","f","l","v"]]
    words = ["oath","pea","eat","rain"] -> ["oath","eat"]

**Steps.**
1. Build a trie of all `words`; at each word's final node store the full word (`node.word = word`) instead of a boolean — the DFS can then emit results without tracking the path.
2. From every cell, start a DFS carrying the current trie node. Only recurse into a neighbor when the trie node has a child for that neighbor's letter — this is the pruning that makes multi-word search cheap.
3. On entering a cell whose trie node has `node.word`, append it to the results and set `node.word = None` so the same word is never reported twice.
4. Mark the cell in place before recursing (`board[r][c] = "#"`) and restore it after — the `#` can never match a trie child, so revisits are impossible.
5. Optional but effective: after exploring a child, delete it from its parent if it ended up with no children and no word — the trie shrinks as words are found, pruning future DFS.

**Complexity.** O(Σ word lengths) to build the trie + O(m · n · 3^(L-1)) for the DFS (`L` = longest word; 3 because you never go back the way you came) / O(Σ word lengths) space.

## Interview follow-ups

After Implement Trie:
- "Implement `delete(word)`." — clear `is_end` at the final node, then walk back up removing nodes that have no children and no `is_end` (keep a parent stack, or recurse).
- "Count words with a given prefix in O(m)?" — store a `pass_count` on every node, incremented on insert; the answer is the count at the prefix node.
- "Trie vs hash set?" — a set answers exact membership in O(m) too, but can't answer prefix queries at all; the trie also shares storage between words with common prefixes.

After Add and Search Words:
- "What's the worst-case pattern?" — all dots: it visits every node at depth `m`. Mitigation: store words also by length so length filtering happens first.
- "Support `*` (zero or more characters)?" — the DFS gains a branching case that either consumes the star or consumes one trie edge — essentially wildcard matching over the trie.

After Word Search II:
- "Why a trie instead of running Word Search once per word?" — per-word search repeats identical grid walks for shared prefixes; the trie walks each shared prefix once and prunes dead branches immediately.

## The task

Two dictionary data structures built on the same prefix-tree core. Words and patterns are non-empty lowercase `a–z` strings (patterns may also contain `.`).

### `Trie` class

Implement a prefix tree with exactly this interface:

- `Trie()` — creates an empty trie.
- `insert(word)` — stores `word`. Inserting the same word twice is harmless.
- `search(word)` — returns `True` if `word` was previously inserted, `False` otherwise. A prefix of an inserted word does **not** count.
- `starts_with(prefix)` — returns `True` if at least one inserted word begins with `prefix` (an inserted word counts as a prefix of itself).

```python
t = Trie()
t.insert("apple")
t.search("apple")       # True
t.search("app")         # False -- "app" itself was never inserted
t.starts_with("app")    # True  -- "apple" begins with "app"
t.insert("app")
t.search("app")         # True
```

Edge cases: searching an empty trie (`False`), a query longer than every stored word (`search("catfish")` after `insert("cat")` → `False`, and `starts_with("catfish")` → `False`), multiple words sharing a prefix, single-character words.

### `WordDictionary` class

Implement a dictionary supporting wildcard lookup with exactly this interface:

- `WordDictionary()` — creates an empty dictionary.
- `add_word(word)` — stores `word` (lowercase letters only, no dots).
- `search(pattern)` — returns `True` if any stored word matches `pattern`. In the pattern, `.` matches exactly one arbitrary letter; every other character matches only itself. The match must cover the **whole** word — pattern and word must have the same length.

```python
d = WordDictionary()
d.add_word("bad")
d.add_word("dad")
d.add_word("mad")
d.search("pad")   # False -- no stored word matches
d.search("bad")   # True  -- exact match
d.search(".ad")   # True  -- "bad", "dad", and "mad" all match
d.search("b..")   # True  -- "bad" matches
d.search("b...")  # False -- no stored 4-letter word
```

Edge cases: searching before any `add_word` (`False`), a pattern of all dots (`"..."` matches any stored 3-letter word), a dot in the **last** position (`"ba."` must still land on a complete word, not just a prefix), a pattern shorter or longer than every stored word (`False`), literal search with no dots behaving like exact lookup.
