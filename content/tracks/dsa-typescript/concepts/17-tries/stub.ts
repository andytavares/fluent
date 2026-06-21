// Run: tsx stub.ts

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
}

export class Trie {
  private root: TrieNode = new TrieNode();

  // Insert a word into the trie.
  insert(word: string): void {
    // TODO: walk/create nodes for each character; mark isEnd = true at the last node
  }

  // Return true if the exact word is in the trie (not just a prefix).
  search(word: string): boolean {
    // TODO: walk nodes; return node.isEnd at the last character
    return false;
  }

  // Return true if any inserted word starts with prefix.
  startsWith(prefix: string): boolean {
    // TODO: walk nodes; return true if all prefix chars exist
    return false;
  }
}

// For each prefix of searchWord, return up to 3 lexicographically smallest
// products that share that prefix.
export function searchSuggestions(products: string[], searchWord: string): string[][] {
  // TODO:
  // 1. Sort products lexicographically.
  // 2. Insert all into a trie.
  // 3. For each prefix of searchWord, DFS from the prefix node to collect up to 3 words.
  return [];
}

// Usage example (uncomment to test manually):
// const t = new Trie();
// t.insert("apple"); t.insert("app");
// console.log(t.search("app"));     // true
// console.log(t.startsWith("ap"));  // true
// console.log(searchSuggestions(["mobile","mouse","moneypot","monitor","mousepad"], "mouse"));
