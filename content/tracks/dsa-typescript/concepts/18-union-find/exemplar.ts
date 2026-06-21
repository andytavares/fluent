// Run: tsx exemplar.ts

export class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array<number>(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      // Path compression: every node on the path now points to the root
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(a: number, b: number): boolean {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return false; // already connected

    // Union by rank: attach smaller tree under larger tree
    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA]++;
    }
    return true; // a new merge happened
  }

  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }
}

export function numConnectedComponents(n: number, edges: [number, number][]): number {
  const uf = new UnionFind(n);
  let components = n;

  for (const [a, b] of edges) {
    if (uf.union(a, b)) components--;
  }
  return components;
}

export function earliestConnectionTime(n: number, edges: [number, number, number][]): number {
  // Sort edges by timestamp
  edges.sort((a, b) => a[0] - b[0]);

  const uf = new UnionFind(n);
  let components = n;

  for (const [time, a, b] of edges) {
    if (uf.union(a, b)) {
      components--;
      if (components === 1) return time; // all nodes in one component
    }
  }
  return -1; // not all nodes connected
}
