// Run: node exemplar.js

/**
 * Returns the number of islands in the grid.
 * DFS flood-fill: mutate '1' to '0' to mark visited. One DFS per island.
 * O(m*n) time, O(m*n) space (call stack).
 * @param {string[][]} grid
 * @returns {number}
 */
function numIslands(grid) {
  if (!grid.length) return 0;
  const rows = grid.length, cols = grid[0].length;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited
    dfs(r + 1, c); dfs(r - 1, c);
    dfs(r, c + 1); dfs(r, c - 1);
  }

  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') { count++; dfs(r, c); }
    }
  }
  return count;
}

/**
 * Returns true if all courses can be completed (no cycle in prerequisite graph).
 * 3-state DFS: 0=unvisited, 1=in-progress (gray), 2=done (black).
 * Back edge (gray to gray) = cycle.
 * O(V + E) time, O(V + E) space.
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @returns {boolean}
 */
function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) adj[b].push(a); // b -> a

  const state = new Array(numCourses).fill(0);

  function dfs(node) {
    if (state[node] === 1) return false; // back edge = cycle
    if (state[node] === 2) return true;  // already fully processed
    state[node] = 1; // mark in-progress
    for (const neighbor of adj[node]) {
      if (!dfs(neighbor)) return false;
    }
    state[node] = 2; // mark done
    return true;
  }

  for (let i = 0; i < numCourses; i++) {
    if (!dfs(i)) return false;
  }
  return true;
}

/**
 * Returns the length of the shortest transformation sequence from beginWord to endWord.
 * BFS on an implicit graph where edges connect words differing by one letter.
 * O(n * L * 26) time, O(n * L) space.
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @returns {number}
 */
function wordLadderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;

  const queue = [[beginWord, 1]]; // [word, steps]
  const visited = new Set([beginWord]);

  while (queue.length) {
    const [word, steps] = queue.shift();
    // Try replacing each character
    for (let i = 0; i < word.length; i++) {
      for (let c = 97; c <= 122; c++) { // 'a' to 'z'
        const next = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
        if (next === endWord) return steps + 1;
        if (wordSet.has(next) && !visited.has(next)) {
          visited.add(next);
          queue.push([next, steps + 1]);
        }
      }
    }
  }

  return 0; // no path found
}

module.exports = { numIslands, canFinish, wordLadderLength };

function main() {
  console.log(numIslands([["1","1","0","0"],["1","0","0","1"],["0","0","0","1"]])); // 2
  console.log(canFinish(2, [[1, 0]]));                                              // true
  console.log(canFinish(2, [[1, 0], [0, 1]]));                                     // false
  console.log(wordLadderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"])); // 5
}

main();
