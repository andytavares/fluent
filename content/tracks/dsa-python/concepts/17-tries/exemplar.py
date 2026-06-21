class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.is_end: bool = False


class Trie:
    """Prefix tree supporting insert, exact search, and prefix search."""

    def __init__(self) -> None:
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end

    def starts_with(self, prefix: str) -> bool:
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True


def search_suggestions(products: list[str], search_word: str) -> list[list[str]]:
    """For each prefix of search_word, return up to 3 lexicographically smallest matches."""
    trie = Trie()
    for product in sorted(products):
        trie.insert(product)

    def dfs_collect(node: TrieNode, prefix: str, results: list[str]) -> None:
        if len(results) == 3:
            return
        if node.is_end:
            results.append(prefix)
        for ch in sorted(node.children):
            dfs_collect(node.children[ch], prefix + ch, results)

    result: list[list[str]] = []
    node = trie.root
    for i, ch in enumerate(search_word):
        if ch not in node.children:
            result.extend([] for _ in range(len(search_word) - i))
            break
        node = node.children[ch]
        suggestions: list[str] = []
        dfs_collect(node, search_word[:i + 1], suggestions)
        result.append(suggestions)

    return result
