// Run: tsx stub.ts

export class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    // TODO: parent[i] = i (each node is its own root); rank[i] = 0
    this.parent = new Array<number>(n).fill(0);
    this.rank = new Array<number>(n).fill(0);
  }

  // Return the root of x's set. Apply path compression.
  find(x: number): number {
    // TODO: if parent[x] !== x, recursively find root and set parent[x] = root
    return x;
  }

  // Merge the sets containing a and b using union by rank.
  // Return true if a new merge happened (a and b were in different sets).
  union(a: number, b: number): boolean {
    // TODO: find roots; if same, return false; else attach smaller rank under larger
    return false;
  }

  // Return true if a and b are in the same set.
  connected(a: number, b: number): boolean {
    // TODO: compare find(a) and find(b)
    return false;
  }
}

// Return the number of connected components among n nodes (0..n-1).
export function numConnectedComponents(n: number, edges: [number, number][]): number {
  // TODO: start with n components; decrement on each successful union
  return n;
}

// Return the earliest time at which all n nodes become connected.
// edges[i] = [time, a, b]: node a connects to node b at this time.
// Return -1 if impossible.
export function earliestConnectionTime(n: number, edges: [number, number, number][]): number {
  // TODO: sort by time; union edges in order; return time when components reach 1
  return -1;
}

// Usage examples (uncomment to test manually):
// const uf = new UnionFind(5);
// uf.union(0, 1); uf.union(1, 2); uf.union(3, 4);
// console.log(uf.connected(0, 2)); // true
// console.log(numConnectedComponents(5, [[0,1],[1,2],[3,4]])); // 2
