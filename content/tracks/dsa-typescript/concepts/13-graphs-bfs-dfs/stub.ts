// Run: tsx stub.ts

// Count islands in the grid. "1" = land, "0" = water.
// Islands are groups of "1"s connected horizontally or vertically.
export function numIslands(grid: string[][]): number {
  // TODO: for each unvisited "1", increment count, DFS to mark the full island
  return 0;
}

// Return true if all courses can be finished (no circular prerequisites).
// prerequisites[i] = [course, prereq]: must take prereq before course.
export function canFinish(numCourses: number, prerequisites: [number, number][]): boolean {
  // TODO: build adjacency list; DFS with state 0/1/2 (unvisited/in-path/done)
  return false;
}

// Return the length of the shortest word-transformation sequence from beginWord to
// endWord (each step changes exactly one letter; intermediate words must be in wordList).
// Return 0 if no sequence exists.
export function wordLadderLength(beginWord: string, endWord: string, wordList: string[]): number {
  // TODO: BFS; precompute wildcard-pattern map for O(L) neighbor lookup per word
  return 0;
}

// Usage examples (uncomment to test manually):
// console.log(numIslands([["1","1","0"],["0","1","0"],["0","0","1"]])); // 2
// console.log(canFinish(2, [[1,0]]));                                   // true
// console.log(wordLadderLength("hit","cog",["hot","dot","dog","lot","log","cog"])); // 5
