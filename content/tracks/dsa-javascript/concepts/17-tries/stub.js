// Run: node stub.js

class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Inserts a word into the trie.
   * @param {string} word
   */
  insert(word) {
    // TODO: walk from root, create child nodes on demand, mark isEnd at last node
  }

  /**
   * Returns true if the exact word was previously inserted.
   * @param {string} word
   * @returns {boolean}
   */
  search(word) {
    // TODO: traverse the path; return false if any char missing or isEnd is false
    return false;
  }

  /**
   * Returns true if any inserted word starts with the given prefix.
   * @param {string} prefix
   * @returns {boolean}
   */
  startsWith(prefix) {
    // TODO: traverse the path; return false if any char is missing
    return false;
  }

  // You may add a _traverse helper if it helps
}

/**
 * For each prefix of searchWord, returns up to 3 lexicographically smallest
 * product names from products that start with that prefix.
 * @param {string[]} products
 * @param {string} searchWord
 * @returns {string[][]}
 */
function searchSuggestions(products, searchWord) {
  // TODO: build a Trie from sorted products
  // For each prefix searchWord.slice(0, i), DFS from the prefix node
  // collecting at most 3 matches per prefix
  return searchWord.split("").map(() => []);
}

module.exports = { Trie, searchSuggestions };

function main() {
  const t = new Trie();
  t.insert("apple");
  console.log(t.search("apple"));    // true
  console.log(t.search("app"));      // false
  console.log(t.startsWith("app"));  // true
  t.insert("app");
  console.log(t.search("app"));      // true

  const suggestions = searchSuggestions(
    ["mobile", "mouse", "moneypot", "monitor", "mousepad"],
    "mouse"
  );
  suggestions.forEach((s, i) => console.log(`prefix ${i + 1}:`, s));
}

main();
