# Tries

## What you'll learn

How a trie (prefix tree) achieves O(m) insert, search, and prefix lookup — independent of dictionary size — and why that makes it the right structure for autocomplete, spell-check, and IP routing tables. You'll build the core Trie class and then implement a search suggestion system on top of it.

## Key concepts

A trie node has at most 26 children (for lowercase English) and an `isEnd` flag.

```js
class TrieNode {
  constructor() {
    this.children = {};   // or new Array(26).fill(null)
    this.isEnd = false;
  }
}
```

Paths from root to any node with `isEnd === true` spell a stored word.

### Insert

Walk character by character. Create child nodes on demand.

```js
insert(word) {
  let node = this.root;
  for (const ch of word) {
    if (!node.children[ch]) node.children[ch] = new TrieNode();
    node = node.children[ch];
  }
  node.isEnd = true;
}
```

### Search (exact match)

Walk the path. Return `false` if any character is missing, or if the final node's `isEnd` is `false`.

```js
search(word) {
  let node = this._traverse(word);
  return node !== null && node.isEnd;
}
```

### startsWith (prefix match)

Same traversal — but don't check `isEnd`.

```js
startsWith(prefix) {
  return this._traverse(prefix) !== null;
}
```

### Shared traversal helper

```js
_traverse(str) {
  let node = this.root;
  for (const ch of str) {
    if (!node.children[ch]) return null;
    node = node.children[ch];
  }
  return node;
}
```

### searchSuggestions — autocomplete from a prefix

Build a trie from `products`, then for each prefix of `searchWord`, DFS from the prefix node to collect up to 3 lexicographically smallest matches.

```js
function searchSuggestions(products, searchWord) {
  const trie = new Trie();
  for (const p of products.sort()) trie.insert(p); // sort once for lex order

  const result = [];
  for (let i = 1; i <= searchWord.length; i++) {
    const prefix = searchWord.slice(0, i);
    const prefixNode = trie._traverse(prefix);
    const suggestions = [];
    if (prefixNode) _dfs(prefixNode, prefix, suggestions);
    result.push(suggestions);
  }
  return result;

  function _dfs(node, word, out) {
    if (out.length === 3) return;
    if (node.isEnd) out.push(word);
    for (const ch of Object.keys(node.children).sort()) {
      _dfs(node.children[ch], word + ch, out);
    }
  }
}
```

Sorting `Object.keys` at each DFS node guarantees lexicographic order.

## Time and space complexity

| Operation | Time | Space |
|-----------|------|-------|
| insert(word) | O(m) | O(m) worst case — new nodes |
| search(word) | O(m) | O(1) |
| startsWith(prefix) | O(m) | O(1) |
| searchSuggestions | O(n·m + len²) | O(n·m) |

`m` = length of word/prefix; `n` = number of products; `len` = `searchWord.length`.
Space for the whole trie: O(n · m). Each prefix query DFS is bounded by 3 results.

## Common variations

- **Word Search II** (LC 212) — trie of words + DFS on grid
- **Replace Words** (LC 648) — find shortest root in trie for each word
- **Design Add and Search Words** (LC 211) — `.` wildcard requires trying all children
- **Longest Word in Dictionary** (LC 720) — only extend nodes where `isEnd` is true

## vs other languages

Python's `collections.defaultdict` makes trie nodes clean: `lambda: defaultdict(lambda: ...)`. Java uses a `TrieNode[]` array of size 26 and converts chars via `ch - 'a'`. In JavaScript, a plain `{}` object as the children map is idiomatic — no character-to-index arithmetic needed, but hash-map overhead is slightly higher than a fixed array.

## FAANG follow-up questions

After Trie class:
- "How would you implement `delete(word)`?" — clear `isEnd` at target node; clean up orphaned nodes bottom-up if needed.
- "How would you count words with a given prefix?" — add a `wordCount` field to each node, increment on insert, check at prefix node.
- "What's the space trade-off vs a hash set?" — a hash set uses O(n·m) space too, but a trie shares prefixes, often using less total space for large dictionaries with common roots.

After searchSuggestions:
- "What if you want the 3 most frequently searched results, not lexicographically smallest?" — store a max-freq counter at each node during insert, use a max-heap for collection.
- "What if the product list updates dynamically?" — insert new products in O(m); the trie handles incremental updates without reprocessing.

## Watch out

- **`search` vs `startsWith`**: forgetting to check `node.isEnd` in `search` causes it to behave like `startsWith`.
- **Empty string**: `insert("")` marks root as `isEnd`. `search("")` should return `true` only if `""` was inserted.
- **searchSuggestions DFS order**: `Object.keys` returns insertion order, not alphabetical. Always call `.sort()` before iterating children — or sort products before inserting so keys are already in order.
- **Early termination**: the DFS `if (out.length === 3) return` is critical — without it you'd collect all words sharing the prefix.

## The task

### `Trie` class

Implement a trie that supports:

- `insert(word)` — store the word
- `search(word)` — return `true` if the exact word was inserted, `false` otherwise
- `startsWith(prefix)` — return `true` if any inserted word begins with `prefix`

```js
const t = new Trie();
t.insert("apple");
t.search("apple")   // true
t.search("app")     // false — "app" not inserted
t.startsWith("app") // true
t.insert("app");
t.search("app")     // true
```

### `searchSuggestions(products, searchWord)`

Given a list of product strings and a `searchWord`, for each prefix of `searchWord` (1 character, 2 characters, etc.) return a list of up to 3 product names that start with that prefix, in lexicographic order.

```js
searchSuggestions(
  ["mobile","mouse","moneypot","monitor","mousepad"],
  "mouse"
)
// [
//   ["mobile","moneypot","monitor"],  // "m"
//   ["mobile","moneypot","monitor"],  // "mo"
//   ["mouse","mousepad"],             // "mou"
//   ["mouse","mousepad"],             // "mous"
//   ["mouse","mousepad"],             // "mouse"
// ]

searchSuggestions(["havana"], "havana")
// [["havana"],["havana"],["havana"],["havana"],["havana"],["havana"]]
```
