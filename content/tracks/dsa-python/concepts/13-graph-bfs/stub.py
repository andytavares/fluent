# Run: python3 stub.py


def min_mutation(start_gene, end_gene, bank):
    """Return the minimum number of mutations (single-character changes,
    each result present in bank) turning start_gene into end_gene, or -1.
    Genes are 8-char strings over A/C/G/T; start_gene need not be in bank."""
    # TODO: return 0 if start == end; put bank in a set (no end_gene -> -1);
    # BFS pairing each gene with its mutation count -- neighbors are the
    # 8 positions x 3 other nucleotides that exist in the bank.
    # Remove from the set when enqueueing (visited-on-push)
    return -1


def ladder_length(begin_word, end_word, word_list):
    """Return the number of WORDS in the shortest transformation sequence
    begin_word -> ... -> end_word (both endpoints counted), where
    consecutive words differ by one letter and every word after
    begin_word is in word_list. Returns 0 if no sequence exists."""
    # TODO: same BFS as min_mutation over a-z, but start the distance at 1 --
    # this problem counts words in the chain, not edges.
    # Generate candidates by substitution (position x letter) against a set;
    # never scan all pairs of words
    return 0


def main():
    print(min_mutation("AACCGGTT", "AACCGGTA", ["AACCGGTA"]))  # 1
    print(min_mutation("AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA", "AAACGGTA"]))  # 2
    print(ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]))  # 5
    print(ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log"]))  # 0


if __name__ == "__main__":
    main()
