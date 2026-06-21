// Run: node exemplar.js

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
   * Walks from root to the node reached by str.
   * Returns the node, or null if any character is missing.
   * @param {string} str
   * @returns {TrieNode|null}
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
   * Inserts a word into the trie. O(m) time, O(m) space worst case.
   * @param {string} word
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
   * Returns true if the exact word was inserted. O(m) time.
   * @param {string} word
   * @returns {boolean}
   */
  search(word) {
    const node = this._traverse(word);
    return node !== null && node.isEnd;
  }

  /**
   * Returns true if any inserted word starts with prefix. O(m) time.
   * @param {string} prefix
   * @returns {boolean}
   */
  startsWith(prefix) {
    return this._traverse(prefix) !== null;
  }
}

/**
 * For each prefix of searchWord, returns up to 3 lexicographically smallest
 * product names from products that start with that prefix.
 *
 * Strategy: insert sorted products into a trie, then DFS from the prefix node
 * at each step, collecting at most 3 results.
 *
 * Time:  O(n·m + len²)  n=products, m=avg length, len=searchWord.length
 * Space: O(n·m) for the trie
 *
 * @param {string[]} products
 * @param {string} searchWord
 * @returns {string[][]}
 */
function searchSuggestions(products, searchWord) {
  const trie = new Trie();
  // Sort once so DFS children are visited in alphabetical order
  for (const p of [...products].sort()) trie.insert(p);

  /**
   * DFS from node, accumulating words (up to 3) that are in the trie.
   * @param {TrieNode} node
   * @param {string} word - current prefix path to this node
   * @param {string[]} out
   */
  function dfs(node, word, out) {
    if (out.length === 3) return; // early termination
    if (node.isEnd) out.push(word);
    for (const ch of Object.keys(node.children).sort()) {
      if (out.length === 3) break;
      dfs(node.children[ch], word + ch, out);
    }
  }

  const result = [];
  for (let i = 1; i <= searchWord.length; i++) {
    const prefix = searchWord.slice(0, i);
    const prefixNode = trie._traverse(prefix);
    const suggestions = [];
    if (prefixNode) dfs(prefixNode, prefix, suggestions);
    result.push(suggestions);
  }
  return result;
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
  console.log(t.startsWith("xyz"));  // false

  const suggestions = searchSuggestions(
    ["mobile", "mouse", "moneypot", "monitor", "mousepad"],
    "mouse"
  );
  suggestions.forEach((s, i) => console.log(`prefix ${i + 1}:`, s));
  // prefix 1: [ 'mobile', 'moneypot', 'monitor' ]
  // prefix 2: [ 'mobile', 'moneypot', 'monitor' ]
  // prefix 3: [ 'mouse', 'mousepad' ]
  // prefix 4: [ 'mouse', 'mousepad' ]
  // prefix 5: [ 'mouse', 'mousepad' ]
}

main();
