// Run: tsx exemplar.ts

class TrieNode {
  children: Record<string, TrieNode> = {}; // char → TrieNode
  isEnd = false;
}

export class Trie {
  private root = new TrieNode();

  /**
   * Walks the path spelled by str through existing children only.
   * Returns the reached node, or null if the path breaks.
   */
  private traverse(str: string): TrieNode | null {
    let node = this.root;
    for (const ch of str) {
      if (!node.children[ch]) return null;
      node = node.children[ch];
    }
    return node;
  }

  /** Stores a word, creating nodes on demand. O(m) time. */
  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  /**
   * Exact-word membership: the path must exist AND end on an isEnd node.
   * O(m) time.
   */
  search(word: string): boolean {
    const node = this.traverse(word);
    return node !== null && node.isEnd;
  }

  /** Prefix membership: the path just has to exist. O(m) time. */
  startsWith(prefix: string): boolean {
    return this.traverse(prefix) !== null;
  }
}

export class WordDictionary {
  private root = new TrieNode();

  /** Stores a word — same walk as Trie.insert. O(m) time. */
  addWord(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  /**
   * Wildcard lookup: "." matches any single letter, so it forks the walk
   * into a DFS that ORs over every child. Recursing by pattern index keeps
   * each frame O(1). O(m) without dots, O(26^d · m) worst case with d dots.
   */
  search(pattern: string): boolean {
    const dfs = (node: TrieNode, i: number): boolean => {
      if (i === pattern.length) return node.isEnd;
      const ch = pattern[i];
      if (ch !== ".") {
        return node.children[ch] ? dfs(node.children[ch], i + 1) : false;
      }
      for (const key of Object.keys(node.children)) {
        if (dfs(node.children[key], i + 1)) return true;
      }
      return false;
    };
    return dfs(this.root, 0);
  }
}

function main(): void {
  const t = new Trie();
  t.insert("apple");
  console.log(t.search("apple"));   // true
  console.log(t.search("app"));     // false
  console.log(t.startsWith("app")); // true
  t.insert("app");
  console.log(t.search("app"));     // true

  const d = new WordDictionary();
  d.addWord("bad");
  d.addWord("dad");
  d.addWord("mad");
  console.log(d.search("pad")); // false
  console.log(d.search("bad")); // true
  console.log(d.search(".ad")); // true
  console.log(d.search("b..")); // true
}

main();
