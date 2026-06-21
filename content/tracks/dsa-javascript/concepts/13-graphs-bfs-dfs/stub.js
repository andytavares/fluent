// Run: node stub.js

/**
 * Returns the number of islands in the grid.
 * @param {string[][]} grid
 * @returns {number}
 */
function numIslands(grid) {
  // TODO: scan grid; when '1' found, increment count and DFS to mark island as '0'
  return 0;
}

/**
 * Returns true if all courses can be completed (no cycle in prerequisite graph).
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @returns {boolean}
 */
function canFinish(numCourses, prerequisites) {
  // TODO: build adjacency list; DFS with state[] (0=unvisited, 1=in-progress, 2=done)
  // return false if state[node] === 1 when revisiting (back edge = cycle)
  return false;
}

/**
 * Returns the length of the shortest transformation sequence from beginWord to endWord.
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @returns {number}
 */
function wordLadderLength(beginWord, endWord, wordList) {
  // TODO: BFS; for each word, try replacing each character with 'a'-'z'
  // if resulting word is in wordSet and unvisited, enqueue with steps+1
  // return steps+1 when endWord is reached; return 0 if queue empties
  return 0;
}

module.exports = { numIslands, canFinish, wordLadderLength };

function main() {
  console.log(numIslands([["1","1","0"],["0","0","1"],["0","0","1"]])); // 2
  console.log(canFinish(2, [[1, 0]]));        // true
  console.log(canFinish(2, [[1,0],[0,1]]));   // false
  console.log(wordLadderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"])); // 5
}

main();
