// Run: tsx exemplar.ts

const DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * Scan every cell; each fresh "1" starts a new island, and an iterative
 * flood fill sinks the whole island to "0" so it is never recounted. Cells
 * are marked when pushed (not when popped) so nothing enters the stack
 * twice. The explicit stack keeps snake-shaped islands from overflowing
 * the call stack.
 * O(rows * cols) time, O(rows * cols) worst-case stack.
 */
export function numIslands(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1") continue;
      count++;
      const stack: [number, number][] = [[r, c]];
      grid[r][c] = "0";
      while (stack.length > 0) {
        const [cr, cc] = stack.pop()!;
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
            grid[nr][nc] = "0";
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return count;
}

/**
 * Deep copy of an adjacency object: one fresh container per level — a new
 * outer object and a new array per node. A shallow copy of the outer
 * object would still share the neighbor arrays, so mutating the clone
 * would corrupt the original.
 * O(V + E) time and space.
 */
export function cloneGraph(graph: Record<string, string[]>): Record<string, string[]> {
  const clone: Record<string, string[]> = {};
  for (const [node, neighbors] of Object.entries(graph)) {
    clone[node] = [...neighbors];
  }
  return clone;
}

/**
 * Kahn's topological sort: a course enters the queue exactly when its last
 * prerequisite is taken. Courses on a cycle never reach indegree 0, so the
 * graph is acyclic iff every course gets processed.
 * O(V + E) time and space.
 */
export function canFinish(numCourses: number, prerequisites: [number, number][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course); // edge prereq -> course
    indegree[course]++;
  }
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i);
  }
  let processed = 0;
  let head = 0;
  while (head < queue.length) {
    const course = queue[head++];
    processed++;
    for (const next of adj[course]) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return processed === numCourses;
}

function main(): void {
  console.log(numIslands([
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"],
  ])); // 3

  const graph = { "1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"] };
  const clone = cloneGraph(graph);
  console.log(JSON.stringify(clone), clone !== graph && clone["1"] !== graph["1"]);

  console.log(canFinish(2, [[1, 0]])); // true
  console.log(canFinish(2, [[1, 0], [0, 1]])); // false
}

main();
