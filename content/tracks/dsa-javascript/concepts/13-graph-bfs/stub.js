// Run: node stub.js

/**
 * Returns the minimum number of mutations (single-character changes, each
 * result present in bank) turning startGene into endGene, or -1.
 * Genes are 8-char strings over A/C/G/T; startGene need not be in bank.
 * @param {string} startGene
 * @param {string} endGene
 * @param {string[]} bank
 * @returns {number}
 */
function minMutation(startGene, endGene, bank) {
  // TODO: return 0 if start === end; put bank in a Set (no endGene → -1);
  // BFS pairing each gene with its mutation count — neighbors are the
  // 8 positions x 3 other nucleotides that exist in the bank.
  // Delete from the set when enqueueing (visited-on-push)
  return -1;
}

/**
 * Returns the number of WORDS in the shortest transformation sequence
 * beginWord -> ... -> endWord (both endpoints counted), where consecutive
 * words differ by one letter and every word after beginWord is in
 * wordList. Returns 0 if no sequence exists.
 * @param {string} beginWord
 * @param {string} endWord  beginWord !== endWord
 * @param {string[]} wordList  lowercase words, all the same length
 * @returns {number}
 */
function ladderLength(beginWord, endWord, wordList) {
  // TODO: same BFS as minMutation over a-z, but start the distance at 1 —
  // this problem counts words in the chain, not edges.
  // Generate candidates by substitution (position x letter) against a Set;
  // never scan all pairs of words
  return 0;
}

module.exports = { minMutation, ladderLength };

function main() {
  console.log(minMutation("AACCGGTT", "AACCGGTA", ["AACCGGTA"])); // 1
  console.log(minMutation("AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA", "AAACGGTA"])); // 2
  console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"])); // 5
  console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"])); // 0
}

main();
