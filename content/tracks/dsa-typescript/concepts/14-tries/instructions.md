# Trie

## What you'll learn

Building on the tree-DFS recursion from Binary Tree and the key-lookup habits from Hash Maps, this concept covers the trie (prefix tree): a character-per-edge tree that makes insert, exact search, and prefix search all O(m) in the word length — independent of how many words are stored. You'll implement the classic `Trie`, extend it with a `.` wildcard (which turns lookup into a small backtracking search), and see how a trie turns the brute-force Word Search II grid problem tractable.

## Key concepts

A trie stores a set of strings as a tree where each edge is one character. Every root-to-node path spells a prefix; nodes flagged `isEnd` mark where a complete word ends. All words sharing a prefix share that prefix's path — that sharing is the whole data structure.

### The node

```ts
class TrieNode {
  children: Record<string, TrieNode> = {}; // char → TrieNode
  isEnd = false;                            // a stored word ends exactly here
}
```

A plain object as the children map is idiomatic — no `ch - 'a'` index arithmetic needed.

### Insert, search, startsWith — one traversal, three verdicts

```ts
insert(word: string): void {
  let node = this.root;
  for (const ch of word) {
    if (!node.children[ch]) node.children[ch] = new TrieNode();
    node = node.children[ch];
  }
  node.isEnd = true;
}
```

`search` and `startsWith` walk the same path without creating nodes. The only difference: `search` demands the final node has `isEnd === true`; `startsWith` just demands the path exists. Factor the walk into a `_traverse(str)` helper that returns the reached node or `null`.

```ts
search(word: string): boolean       { const n = this._traverse(word);   return n !== null && n.isEnd; }
startsWith(prefix: string): boolean { return this._traverse(prefix) !== null; }
```

### Wildcard lookup — a fork in the walk

Add a `.` character that matches any single letter and the walk stops being a straight line: at a `.` you must try **every** child and succeed if any branch matches the rest of the pattern. That's a depth-first search over the trie, indexed by pattern position:

```ts
function dfs(node: TrieNode, i: number): boolean {
  if (i === pattern.length) return node.isEnd;
  const ch = pattern[i];
  if (ch !== ".") {
    return node.children[ch] ? dfs(node.children[ch], i + 1) : false;
  }
  for (const key of Object.keys(node.children)) {
    if (dfs(node.children[key], i + 1)) return true;
  }
  return false;
}
```

A pattern of all dots degrades to visiting every node at that depth — worst case O(26^d) for `d` dots — but concrete characters prune hard, which is why this is fast in practice.

### Trie + grid DFS — searching for many words at once

Word Search II asks: which of `words` can be traced through adjacent cells of a letter grid? Searching the grid once *per word* repeats the same cell walks over and over. Instead, put all the words in one trie and walk the grid and the trie **together**: from each cell, only descend into a neighbor if the trie has a child for that letter. One grid DFS now matches every word simultaneously, and dead prefixes are pruned the moment the trie has no matching child.

### Complexity of the flagship problems

| Operation | Time | Space |
|-----------|------|-------|
| `Trie.insert(word)` | O(m) | O(m) new nodes worst case |
| `Trie.search(word)` / `startsWith(prefix)` | O(m) | O(1) |
| `WordDictionary.addWord(word)` | O(m) | O(m) |
| `WordDictionary.search(pattern)` | O(m) no dots; O(26^d · m) worst case with `d` dots | O(m) recursion |
| Word Search II | O(Σ word lengths) build + O(rows · cols · 3^(L-1)) DFS | O(Σ word lengths) |

`m` = word/pattern length, `L` = longest word.

## Watch out

- **`search` vs `startsWith`**: forgetting the `isEnd` check makes `search` behave like `startsWith` — `search("app")` must be `false` after only `insert("apple")`.
- **Wildcard `.` must OR over all children.** Returning the result of the first child (instead of continuing when it fails) is the classic bug: `search(".ad")` with words `bad`/`dad`/`mad` has to try `b`, and keep going if a branch dies.
- **A dot at the last position still needs `isEnd`.** The base case is `i === pattern.length → node.isEnd`, not `true` — otherwise `"b.."` would match a stored `"badge"` prefix.
- **Length must match exactly**: `"b..."` does not match `"bad"`. The base case handles this automatically if you only succeed at `i === pattern.length`.
- **Word Search II bookkeeping**: mark a cell before recursing and restore it after (`board[r][c] = "#"` then put the letter back), and null out a word at its end node once found so it isn't reported twice.

## Problem walkthroughs

### Implement Trie (Prefix Tree) ★

**Problem.** Build a `Trie` class over lowercase words with three operations: `insert(word)` stores a word; `search(word)` returns whether that exact word was stored; `startsWith(prefix)` returns whether any stored word begins with `prefix`.

**Example.**

    insert("apple"); search("apple") → true; search("app") → false;
    startsWith("app") → true; insert("app"); search("app") → true

**Steps.**
1. Root is an empty `TrieNode` (`children: {}`, `isEnd: false`).
2. `insert`: walk character by character from the root, creating a child node whenever one is missing; set `isEnd = true` on the final node.
3. Write `_traverse(str)`: follow existing children only; return `null` the moment a character has no child, otherwise the final node.
4. `search(word)` = `_traverse(word)` reached a node **and** that node's `isEnd` is true. `startsWith(prefix)` = `_traverse(prefix)` reached a node, period.
5. The invariant: a node exists exactly when some inserted word passes through that prefix, and `isEnd` is true exactly when some inserted word ends there.

**Complexity.** O(m) time per operation / O(m) new nodes per insert worst case — no dependence on the number of stored words.

### Design Add and Search Words Data Structure ★

**Problem.** Build a `WordDictionary` class: `addWord(word)` stores a lowercase word; `search(pattern)` returns whether any stored word matches `pattern`, where `.` in the pattern matches exactly one arbitrary letter and every other character must match literally. The whole pattern must match a whole word (same length).

**Example.**

    addWord("bad"); addWord("dad"); addWord("mad")
    search("pad") → false;  search("bad") → true
    search(".ad") → true;   search("b..") → true

**Steps.**
1. Reuse the trie node and `addWord` = `Trie.insert`.
2. `search` is a recursive DFS `dfs(node, i)` over pattern index `i`.
3. Base case: `i === pattern.length` → return `node.isEnd` (full pattern consumed exactly at a word end).
4. Literal character: descend into `children[ch]` if it exists, else return `false`.
5. Dot: loop over all children; return `true` as soon as any branch matches the remaining pattern; `false` if none do.
6. Recursing by index (not by slicing the pattern) keeps each frame O(1).

**Complexity.** O(m) time for dot-free patterns; worst case O(26^d · m) with `d` dots / O(m) recursion depth.

### Word Search II

**Problem.** Given an `m × n` grid of letters and a list `words`, return every word that can be formed by tracing adjacent cells (up/down/left/right), using each cell at most once per word.

**Example.**

    board = [["o","a","a","n"],
             ["e","t","a","e"],
             ["i","h","k","r"],
             ["i","f","l","v"]]
    words = ["oath","pea","eat","rain"] → ["oath","eat"]

**Steps.**
1. Build a trie of all `words`; at each word's final node store the full word (`node.word = word`) instead of a boolean — the DFS can then emit results without tracking the path.
2. From every cell, start a DFS carrying the current trie node. Only recurse into a neighbor when the trie node has a child for that neighbor's letter — this is the pruning that makes multi-word search cheap.
3. On entering a cell whose trie node has `node.word`, push it to the results and set `node.word = null` so the same word is never reported twice.
4. Mark the cell in place before recursing (`board[r][c] = "#"`) and restore it after — the `#` can never match a trie child, so revisits are impossible.
5. Optional but effective: after exploring a child, delete it from its parent if it ended up with no children and no word — the trie shrinks as words are found, pruning future DFS.

**Complexity.** O(Σ word lengths) to build the trie + O(m · n · 3^(L-1)) for the DFS (`L` = longest word; 3 because you never go back the way you came) / O(Σ word lengths) space.

## Interview follow-ups

After Implement Trie:
- "Implement `delete(word)`." — clear `isEnd` at the final node, then walk back up removing nodes that have no children and no `isEnd` (keep a parent stack, or recurse).
- "Count words with a given prefix in O(m)?" — store a `passCount` on every node, incremented on insert; the answer is the count at the prefix node.
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

- `new Trie()` — creates an empty trie.
- `insert(word)` — stores `word`. Inserting the same word twice is harmless.
- `search(word)` — returns `true` if `word` was previously inserted, `false` otherwise. A prefix of an inserted word does **not** count.
- `startsWith(prefix)` — returns `true` if at least one inserted word begins with `prefix` (an inserted word counts as a prefix of itself).

```ts
const t = new Trie();
t.insert("apple");
t.search("apple");   // true
t.search("app");     // false — "app" itself was never inserted
t.startsWith("app"); // true  — "apple" begins with "app"
t.insert("app");
t.search("app");     // true
```

Edge cases: searching an empty trie (`false`), a query longer than every stored word (`search("catfish")` after `insert("cat")` → `false`, and `startsWith("catfish")` → `false`), multiple words sharing a prefix, single-character words.

### `WordDictionary` class

Implement a dictionary supporting wildcard lookup with exactly this interface:

- `new WordDictionary()` — creates an empty dictionary.
- `addWord(word)` — stores `word` (lowercase letters only, no dots).
- `search(pattern)` — returns `true` if any stored word matches `pattern`. In the pattern, `.` matches exactly one arbitrary letter; every other character matches only itself. The match must cover the **whole** word — pattern and word must have the same length.

```ts
const d = new WordDictionary();
d.addWord("bad");
d.addWord("dad");
d.addWord("mad");
d.search("pad");  // false — no stored word matches
d.search("bad");  // true  — exact match
d.search(".ad");  // true  — "bad", "dad", and "mad" all match
d.search("b..");  // true  — "bad" matches
d.search("b...")  // false — no stored 4-letter word
```

Edge cases: searching before any `addWord` (`false`), a pattern of all dots (`"..."` matches any stored 3-letter word), a dot in the **last** position (`"ba."` must still land on a complete word, not just a prefix), a pattern shorter or longer than every stored word (`false`), literal search with no dots behaving like exact lookup.
