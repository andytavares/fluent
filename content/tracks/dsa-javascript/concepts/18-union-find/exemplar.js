// Run: node exemplar.js

class UnionFind {
  /**
   * Initializes n elements each in their own component.
   * @param {number} n
   */
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  /**
   * Returns the root of x's component with path compression.
   * O(α(n)) amortized.
   * @param {number} x
   * @returns {number}
   */
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  /**
   * Merges components of a and b using union by rank.
   * Returns true if merged, false if already connected.
   * @param {number} a
   * @param {number} b
   * @returns {boolean}
   */
  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false; // already in same component
    if (this.rank[ra] < this.rank[rb]) {
      this.parent[ra] = rb;
    } else if (this.rank[ra] > this.rank[rb]) {
      this.parent[rb] = ra;
    } else {
      this.parent[rb] = ra;
      this.rank[ra]++;
    }
    return true;
  }

  /**
   * Returns true if a and b share a component.
   * @param {number} a
   * @param {number} b
   * @returns {boolean}
   */
  connected(a, b) {
    return this.find(a) === this.find(b);
  }
}

/**
 * Returns the number of connected components in an undirected graph.
 * Starts with n components; each successful union reduces count by 1.
 * O(E · α(n)) time.
 * @param {number} n
 * @param {number[][]} edges
 * @returns {number}
 */
function numConnectedComponents(n, edges) {
  const uf = new UnionFind(n);
  let components = n;
  for (const [a, b] of edges) {
    if (uf.union(a, b)) components--;
  }
  return components;
}

/**
 * Returns the earliest timestamp at which all n nodes become fully connected.
 * Returns -1 if that never happens.
 *
 * Sort connections by time, then union greedily.
 * Each successful union decrements the component count.
 * When components === 1, all nodes are connected — return the current time.
 *
 * Time:  O(E log E) for sort + O(E · α(n)) for union-find = O(E log E)
 * Space: O(n) for the union-find structure
 *
 * @param {number} n
 * @param {number[][]} connections  each element: [time, u, v]
 * @returns {number}
 */
function earliestConnectionTime(n, connections) {
  const sorted = [...connections].sort((a, b) => a[0] - b[0]);
  const uf = new UnionFind(n);
  let components = n;
  for (const [time, u, v] of sorted) {
    if (uf.union(u, v)) {
      components--;
      if (components === 1) return time; // all nodes in one component
    }
  }
  return -1; // never fully connected
}

module.exports = { UnionFind, numConnectedComponents, earliestConnectionTime };

function main() {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  uf.union(1, 2);
  console.log(uf.connected(0, 2)); // true
  console.log(uf.connected(0, 3)); // false
  console.log(uf.union(0, 2));     // false — already connected

  console.log(numConnectedComponents(5, [[0,1],[1,2],[3,4]])); // 2
  console.log(numConnectedComponents(4, [[0,1],[2,3],[1,2]])); // 1
  console.log(numConnectedComponents(3, []));                  // 3

  console.log(earliestConnectionTime(4, [[2,0,1],[3,1,2],[5,2,3]])); // 5
  console.log(earliestConnectionTime(3, [[1,0,1],[2,1,2]]));         // 2
  console.log(earliestConnectionTime(4, [[1,0,1],[2,1,2]]));         // -1
}

main();
