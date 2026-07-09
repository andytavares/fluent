# Run: python3 exemplar.py


class TrieNode:
    def __init__(self):
        self.children = {}   # char -> TrieNode
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def _traverse(self, s):
        """Walk the path spelled by s through existing children only.
        Returns the reached node, or None if the path breaks."""
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def insert(self, word):
        """Store a word, creating nodes on demand. O(m) time."""
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        """Exact-word membership: the path must exist AND end on an
        is_end node. O(m) time."""
        node = self._traverse(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        """Prefix membership: the path just has to exist. O(m) time."""
        return self._traverse(prefix) is not None


class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def add_word(self, word):
        """Store a word -- same walk as Trie.insert. O(m) time."""
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, pattern):
        """Wildcard lookup: "." matches any single letter, so it forks the
        walk into a DFS that ORs over every child. Recursing by pattern
        index keeps each frame O(1). O(m) without dots, O(26^d * m) worst
        case with d dots."""

        def dfs(node, i):
            if i == len(pattern):
                return node.is_end
            ch = pattern[i]
            if ch != ".":
                return ch in node.children and dfs(node.children[ch], i + 1)
            return any(dfs(child, i + 1) for child in node.children.values())

        return dfs(self.root, 0)


def main():
    t = Trie()
    t.insert("apple")
    print(t.search("apple"))     # True
    print(t.search("app"))       # False
    print(t.starts_with("app"))  # True
    t.insert("app")
    print(t.search("app"))       # True

    d = WordDictionary()
    d.add_word("bad")
    d.add_word("dad")
    d.add_word("mad")
    print(d.search("pad"))  # False
    print(d.search("bad"))  # True
    print(d.search(".ad"))  # True
    print(d.search("b..")) # True


if __name__ == "__main__":
    main()
