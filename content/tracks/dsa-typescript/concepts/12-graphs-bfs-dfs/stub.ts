// Run: tsx stub.ts

/**
 * Returns the number of islands: maximal groups of "1" cells connected
 * horizontally or vertically. The grid may be mutated.
 * grid is rectangular; cells are "1" (land) or "0" (water).
 */
export function numIslands(grid: string[][]): number {
  // TODO: scan every cell; each fresh "1" is a new island — flood fill from
  // it (explicit stack, 4 directions), sinking reached "1"s to "0".
  // Bounds-check neighbors, and compare against the STRING "1"
  return 0;
}

/**
 * Returns a deep copy of an undirected graph given as an adjacency object.
 * No reference may be shared with the input — not the outer object, not
 * any neighbor array. graph maps node label -> neighbor labels.
 */
export function cloneGraph(graph: Record<string, string[]>): Record<string, string[]> {
  // TODO: one fresh container per level — a new outer object, and a new
  // array for every node's neighbors (a shallow copy still shares arrays)
  return {};
}

/**
 * Returns true if all courses can be taken — i.e. the prerequisite graph
 * has no cycle. Courses are labeled 0..numCourses-1; prerequisites[i] = [a, b]
 * means b must be taken before a.
 */
export function canFinish(numCourses: number, prerequisites: [number, number][]): boolean {
  // TODO: Kahn's algorithm — adjacency b -> a plus indegree per course;
  // queue indegree-0 courses, peel and decrement dependents; finished
  // course count === numCourses means acyclic
  return false;
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
