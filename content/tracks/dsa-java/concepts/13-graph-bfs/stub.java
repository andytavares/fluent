import java.util.List;

class Solution {

    // Genes are 8-char strings over A/C/G/T; startGene need not be in bank.
    // Returns the minimum number of mutations (single-character changes,
    // each result present in bank) turning startGene into endGene, or -1.
    public static int minMutation(String startGene, String endGene, String[] bank) {
        // TODO: return 0 if startGene equals endGene; put bank in a HashSet
        // (no endGene -> -1); BFS pairing each gene with its mutation count —
        // neighbors are the 8 positions x 3 other nucleotides that exist in
        // the set. Remove from the set when enqueueing (visited-on-push).
        return -1;
    }

    // Returns the number of WORDS in the shortest transformation sequence
    // beginWord -> ... -> endWord (both endpoints counted), where
    // consecutive words differ by one letter and every word after
    // beginWord is in wordList. Returns 0 if no sequence exists.
    // beginWord != endWord; all words are lowercase and the same length.
    public static int ladderLength(String beginWord, String endWord, List<String> wordList) {
        // TODO: same BFS as minMutation over a-z, but start the distance at 1
        // — this problem counts words in the chain, not edges. Generate
        // candidates by substitution (position x letter) against a HashSet;
        // never scan all pairs of words.
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minMutation("AACCGGTT", "AACCGGTA", new String[]{"AACCGGTA"})); // 1
        System.out.println(minMutation("AACCGGTT", "AAACGGTA",
            new String[]{"AACCGGTA", "AACCGCTA", "AAACGGTA"})); // 2
        System.out.println(ladderLength("hit", "cog", List.of("hot", "dot", "dog", "lot", "log", "cog"))); // 5
        System.out.println(ladderLength("hit", "cog", List.of("hot", "dot", "dog", "lot", "log"))); // 0
    }
}
