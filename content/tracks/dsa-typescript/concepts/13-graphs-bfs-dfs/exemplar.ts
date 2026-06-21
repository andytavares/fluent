// Run: tsx exemplar.ts

export function numIslands(grid: string[][]): number {
  const rows = grid.length;
  if (rows === 0) return 0;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number): void {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0"; // mark visited
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}

export function canFinish(numCourses: number, prerequisites: [number, number][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) adj[pre].push(course);

  // 0 = unvisited, 1 = in current DFS path, 2 = fully processed
  const state = new Array<0 | 1 | 2>(numCourses).fill(0);

  function dfs(node: number): boolean {
    if (state[node] === 1) return false; // back edge → cycle
    if (state[node] === 2) return true;  // already verified
    state[node] = 1;
    for (const neighbor of adj[node]) {
      if (!dfs(neighbor)) return false;
    }
    state[node] = 2;
    return true;
  }

  for (let i = 0; i < numCourses; i++) {
    if (!dfs(i)) return false;
  }
  return true;
}

export function wordLadderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;

  // Precompute wildcard-pattern → matching words
  // e.g. "h*t" → ["hot", "hat"]  for O(L) neighbor lookup
  const patternMap = new Map<string, string[]>();
  for (const word of wordSet) {
    for (let i = 0; i < word.length; i++) {
      const key = word.slice(0, i) + "*" + word.slice(i + 1);
      const bucket = patternMap.get(key);
      if (bucket) bucket.push(word);
      else patternMap.set(key, [word]);
    }
  }

  const visited = new Set([beginWord]);
  const queue: string[] = [beginWord];
  let steps = 1;

  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const word = queue.shift()!;
      for (let j = 0; j < word.length; j++) {
        const key = word.slice(0, j) + "*" + word.slice(j + 1);
        for (const neighbor of patternMap.get(key) ?? []) {
          if (neighbor === endWord) return steps + 1;
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
    steps++;
  }
  return 0;
}
