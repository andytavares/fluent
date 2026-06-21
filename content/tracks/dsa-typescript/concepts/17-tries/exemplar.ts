// Run: tsx exemplar.ts

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
}

export class Trie {
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

export function searchSuggestions(products: string[], searchWord: string): string[][] {
  // Sort so DFS yields words in lexicographic order
  products.sort();

  // Build trie from sorted products
  const root = new TrieNode();
  for (const product of products) {
    let node = root;
    for (const ch of product) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  // DFS to collect up to 3 complete words from this subtree
  function collect(node: TrieNode, prefix: string, results: string[]): void {
    if (results.length === 3) return;
    if (node.isEnd) results.push(prefix);
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
