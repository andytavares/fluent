// Run: node stub.js

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
   * Stores a word in the trie.
   * @param {string} word
   * @returns {void}
   */
  insert(word) {
    // TODO: walk from the root, creating child nodes on demand;
    // set isEnd = true on the final node
  }

  /**
   * Returns true if the exact word was previously inserted.
   * @param {string} word
   * @returns {boolean}
   */
  search(word) {
    // TODO: follow existing children only; false if a char is missing
    // OR the final node's isEnd is false
    return false;
  }

  /**
   * Returns true if any inserted word begins with prefix.
   * @param {string} prefix
   * @returns {boolean}
   */
  startsWith(prefix) {
    // TODO: same walk as search, but no isEnd check
    return false;
  }

  // Tip: factor the walk into a _traverse(str) helper that returns
  // the reached node or null.
}

class WordDictionary {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Stores a word (lowercase letters, no dots).
   * @param {string} word
   * @returns {void}
   */
  addWord(word) {
    // TODO: identical to Trie.insert
  }

  /**
   * Returns true if any stored word matches pattern, where "." matches
   * exactly one arbitrary letter. Pattern and word lengths must match.
   * @param {string} pattern
   * @returns {boolean}
   */
  search(pattern) {
    // TODO: recursive dfs(node, i) over the pattern index —
    // base case i === pattern.length → node.isEnd;
    // literal char → descend into that child (false if missing);
    // "." → try every child, true if ANY branch matches the rest
    return false;
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
