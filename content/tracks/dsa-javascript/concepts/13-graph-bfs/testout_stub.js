/**
 * Genes are 8-char strings over A/C/G/T. One mutation changes one
 * character; every gene mutated into (including endGene) must be in bank.
 * Returns the minimum number of mutations, or -1 if impossible.
 * @param {string} startGene
 * @param {string} endGene
 * @param {string[]} bank
 * @returns {number}
 */
function minMutation(startGene, endGene, bank) {
  return -1;
}

/**
 * Returns the number of words in the shortest transformation sequence
 * beginWord -> ... -> endWord (endpoints counted), where consecutive words
 * differ by one letter and every word after beginWord is in wordList.
 * Returns 0 if no sequence exists.
 * @param {string} beginWord
 * @param {string} endWord  beginWord !== endWord
 * @param {string[]} wordList  lowercase words, all the same length
 * @returns {number}
 */
function ladderLength(beginWord, endWord, wordList) {
  return 0;
}

module.exports = { minMutation, ladderLength };
