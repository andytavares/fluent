# Tries

## What you'll learn

How a trie (prefix tree) achieves O(k) prefix lookups independent of dictionary size, and how to apply it to autocomplete — a direct FAANG interview pattern. You'll implement a `Trie` class and `searchSuggestions` (the "search autocomplete system" problem).

## Key concepts

### Trie structure

Each node stores its children in a `Map<string, TrieNode>`. A boolean `isEnd` marks whether the path from root to this node spells a complete word.

```typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
}

class Trie {
  private root: TrieNode = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return node.isEnd; // must be a complete word, not just a prefix
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return true;
  }
}
```

**`search` vs `startsWith`**: both traverse the same path. The difference is the final check: `search` requires `node.isEnd === true`; `startsWith` returns `true` for any node reached (even a non-terminal one).

### Search Suggestions (LeetCode 1268)

Given a sorted product list and a search word, return the top 3 lexicographic suggestions for each prefix typed.

```typescript
function searchSuggestions(products: string[], searchWord: string): string[][] {
  // Sort products lexicographically so DFS collects them in order
  products.sort();

  const root = new TrieNode();

  // Insert all products
  for (const product of products) {
    let node = root;
    for (const ch of product) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  // DFS to collect up to 3 words from a node
  function collect(node: TrieNode, prefix: string, results: string[]): void {
    if (results.length === 3) return;
    if (node.isEnd) results.push(prefix);
    // Map iteration order = insertion order = sorted (since we sorted products)
    for (const [ch, child] of node.children) {
      if (results.length === 3) break;
      collect(child, prefix + ch, results);
    }
  }

  const result: string[][] = [];
  let node: TrieNode | undefined = root;
  let prefix = "";

  for (const ch of searchWord) {
    node = node?.children.get(ch);
    prefix += ch;
    const suggestions: string[] = [];
    if (node) collect(node, prefix, suggestions);
    result.push(suggestions);
  }
  return result;
}
```

**Key insight**: because products are sorted before insertion, the trie's Map children are inserted in lexicographic order. DFS on the trie then naturally yields words in sorted order — no extra sorting needed at query time.

## Complexity

| Operation | Time | Space | Notes |
|-----------|------|-------|-------|
| `insert` | O(k) | O(k) new nodes | k = word length |
| `search` | O(k) | O(1) | k = word length |
| `startsWith` | O(k) | O(1) | |
| `searchSuggestions` build | O(N·k log(N)) | O(N·k) | Sort + insert N products |
| `searchSuggestions` query | O(S + S·3) = O(S) | O(S) | S = searchWord length |

## Common variations

- **Word search II** — trie of dictionary + backtracking on grid; prune when no trie prefix matches
- **Replace words** — for each word in sentence, find the shortest root in trie and replace
- **Longest word in dictionary** — DFS/BFS on trie; find the deepest node reachable via `isEnd`-only nodes
- **Map sum pairs** — augment trie nodes with sum values; prefix query sums all words under the prefix

## vs hash map / sorted array

| Approach | Prefix search | Word lookup | Build time |
|----------|--------------|-------------|------------|
| `Set<string>` + linear scan | O(n·k) | O(k) avg | O(n) |
| Sorted array + binary search | O(log n + k) | O(log n) | O(n log n) |
| Trie | O(k) | O(k) | O(n·k) |

For autocomplete with large dictionaries, a trie's O(k) prefix walk is hard to beat. The sorted-array + binary search approach is competitive for static dictionaries.

## Watch out

- **`search` vs `startsWith`**: a common bug is returning `true` from `search` just because the path exists without checking `isEnd`. "app" might be a prefix of "apple" in the trie — that doesn't make "app" a word.
- **`searchSuggestions` with an unknown prefix char**: when `node?.children.get(ch)` returns `undefined` (the character isn't in the trie), all subsequent prefixes also return `[]`. The `node = node?.children.get(ch)` handles this gracefully.
- **Map insertion order**: JavaScript's `Map` preserves insertion order. The `searchSuggestions` approach relies on inserting sorted products so the DFS collects in lexicographic order. If products are not sorted first, results will be in arbitrary order.
- **Empty string insert/search**: inserting `""` sets `root.isEnd = true`. Searching for `""` returns `root.isEnd`. This is technically correct but unusual in practice.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you implement delete in a trie?" (Walk to the word's terminal node; set `isEnd = false`. Optionally prune nodes with no children and no words — requires a bottom-up traversal.)
> - "What if we want case-insensitive search?" (Normalize to lowercase on insert and lookup. Or add both cases to the trie if you need case-preserving output.)
> - "How would you use a trie for word search on a grid?" (Insert all dictionary words into the trie. DFS on the grid, advancing the trie pointer as you match characters. Prune when the trie pointer goes dead — this is the key speedup over naive backtracking.)
> - "How does a compressed trie (Patricia trie / radix tree) differ?" (Collapse single-child chains into single edges labeled with strings instead of characters. Reduces space for sparse dictionaries.)

## The task

Implement the `Trie` class and `searchSuggestions`:

```typescript
// Trie data structure for string lookups and prefix queries.
class Trie {
  insert(word: string): void
  search(word: string): boolean   // exact word, not just prefix
  startsWith(prefix: string): boolean
}

// For each prefix of searchWord, return up to 3 lexicographically smallest
// products from the list that share that prefix.
// products=["mobile","mouse","moneypot","monitor","mousepad"], searchWord="mouse"
// → [["mobile","moneypot","monitor"],  // prefix "m"
//    ["mobile","moneypot","monitor"],  // prefix "mo"
//    ["mouse","mousepad"],             // prefix "mou"
//    ["mouse","mousepad"],             // prefix "mous"
//    ["mouse","mousepad"]]             // prefix "mouse"
function searchSuggestions(products: string[], searchWord: string): string[][]
```
