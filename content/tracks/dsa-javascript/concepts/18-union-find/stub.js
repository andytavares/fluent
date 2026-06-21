// Run: node stub.js

class UnionFind {
  /**
   * Initializes n elements, each in its own component.
   * @param {number} n
   */
  constructor(n) {
    // TODO: initialize parent array (parent[i] = i) and rank array (all zeros)
    this.parent = [];
    this.rank = [];
  }

  /**
   * Returns the root of x's component.
   * Apply path compression: point every node on the path directly to the root.
   * @param {number} x
   * @returns {number}
   */
  find(x) {
    // TODO: recurse to root; compress path on the way back
    return x;
  }

  /**
   * Merges the components containing a and b.
   * Returns true if merged, false if they were already in the same component.
   * Use union by rank.
   * @param {number} a
   * @param {number} b
   * @returns {boolean}
   */
  union(a, b) {
    // TODO: find roots; attach smaller-rank tree under larger-rank; increment rank on tie
    return false;
  }

  /**
   * Returns true if a and b are in the same component.
   * @param {number} a
   * @param {number} b
   * @returns {boolean}
   */
  connected(a, b) {
    // TODO: compare roots
    return false;
  }
}

/**
 * Returns the number of connected components in an undirected graph.
 * @param {number} n - number of nodes (0..n-1)
 * @param {number[][]} edges - undirected edges [a, b]
 * @returns {number}
 */
function numConnectedComponents(n, edges) {
  // TODO: create UnionFind of size n; union each edge; count remaining components
  return n;
}

/**
 * Returns the earliest timestamp at which all n nodes become fully connected.
 * Returns -1 if never.
 * @param {number} n - number of nodes (0..n-1)
 * @param {number[][]} connections - each element: [time, u, v]
 * @returns {number}
 */
function earliestConnectionTime(n, connections) {
  // TODO: sort connections by time; union edges in order;
  // when components reaches 1, return current time; else return -1
  return -1;
}

module.exports = { UnionFind, numConnectedComponents, earliestConnectionTime };

function main() {
  const uf = new UnionFind(5);
  uf.union(0, 1);
  uf.union(1, 2);
  console.log(uf.connected(0, 2)); // true
  console.log(uf.connected(0, 3)); // false

  console.log(numConnectedComponents(5, [[0,1],[1,2],[3,4]])); // 2
  console.log(numConnectedComponents(4, [[0,1],[2,3],[1,2]])); // 1

  console.log(earliestConnectionTime(4, [[2,0,1],[3,1,2],[5,2,3]])); // 5
  console.log(earliestConnectionTime(4, [[1,0,1],[2,1,2]]));         // -1
}

main();
