# Run: python3 stub.py


class TrieNode:
    def __init__(self):
        self.children = {}   # char -> TrieNode
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        """Store word in the trie."""
        # TODO: walk from the root, creating child nodes on demand;
        # set is_end = True on the final node
        pass

    def search(self, word):
        """Return True if the exact word was previously inserted."""
        # TODO: follow existing children only; False if a char is missing
        # OR the final node's is_end is False
        return False

    def starts_with(self, prefix):
        """Return True if any inserted word begins with prefix."""
        # TODO: same walk as search, but no is_end check
        return False

    # Tip: factor the walk into a _traverse(s) helper that returns
    # the reached node or None.


class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def add_word(self, word):
        """Store a word (lowercase letters, no dots)."""
        # TODO: identical to Trie.insert
        pass

    def search(self, pattern):
        """Return True if any stored word matches pattern, where "." matches
        exactly one arbitrary letter. Pattern and word lengths must match."""
        # TODO: recursive dfs(node, i) over the pattern index --
        # base case i == len(pattern) -> node.is_end;
        # literal char -> descend into that child (False if missing);
        # "." -> try every child, True if ANY branch matches the rest
        return False


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
