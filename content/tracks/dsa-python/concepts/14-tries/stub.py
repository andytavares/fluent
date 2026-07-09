class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.is_end: bool = False


class Trie:
    """Prefix tree supporting insert, exact search, and prefix search."""

    def __init__(self) -> None:
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        """Insert word into the trie."""
        # TODO: walk characters; create TrieNode if missing; mark is_end at last node
        pass

    def search(self, word: str) -> bool:
        """Return True if word exists exactly in the trie."""
        # TODO: walk characters; return False if any missing; return node.is_end
        return False

    def starts_with(self, prefix: str) -> bool:
        """Return True if any inserted word starts with prefix."""
        # TODO: walk characters; return False if any missing; return True at end
        return False


def search_suggestions(products: list[str], search_word: str) -> list[list[str]]:
    """For each prefix of search_word, return up to 3 lexicographically smallest
    product names that share that prefix."""
    # TODO: build a Trie from sorted products; for each prefix, DFS to collect
    #       up to 3 results; if a prefix has no match, pad remaining with []
    return []


if __name__ == "__main__":
    t = Trie()
    t.insert("apple")
    print(t.search("apple"))     # True
    print(t.search("app"))       # False
    print(t.starts_with("app"))  # True
    t.insert("app")
    print(t.search("app"))       # True
    r = search_suggestions(["mobile","mouse","moneypot","monitor","mousepad"], "mouse")
    for row in r:
        print(row)
