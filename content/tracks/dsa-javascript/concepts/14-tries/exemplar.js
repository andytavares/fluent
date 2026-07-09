// Run: node exemplar.js

class TrieNode {
  constructor() {
    this.children = {}; // char → TrieNode
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Walks the path spelled by str through existing children only.
   * @param {string} str
   * @returns {TrieNode|null} the reached node, or null if the path breaks
   */
  _traverse(str) {
    let node = this.root;
    for (const ch of str) {
      if (!node.children[ch]) return null;
      node = node.children[ch];
    }
    return node;
  }

  /**
   * Stores a word, creating nodes on demand. O(m) time.
   * @param {string} word
   * @returns {void}
   */
  insert(word) {
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
   * @param {string} word
   * @returns {boolean}
   */
  search(word) {
    const node = this._traverse(word);
    return node !== null && node.isEnd;
  }

  /**
   * Prefix membership: the path just has to exist. O(m) time.
   * @param {string} prefix
   * @returns {boolean}
   */
  startsWith(prefix) {
    return this._traverse(prefix) !== null;
  }
}

class WordDictionary {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Stores a word — same walk as Trie.insert. O(m) time.
   * @param {string} word
   * @returns {void}
   */
  addWord(word) {
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
   * @param {string} pattern
   * @returns {boolean}
   */
  search(pattern) {
    const dfs = (node, i) => {
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

module.exports = { Trie, WordDictionary };

function main() {
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
