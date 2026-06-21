// Run: tsx stub.ts

export class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Return a list of levels, each containing node values left-to-right.
export function levelOrder(root: TreeNode | null): number[][] {
  // TODO: BFS with a queue; snapshot queue.length to separate levels
  return [];
}

// Return the rightmost visible node value at each level.
export function rightSideView(root: TreeNode | null): number[] {
  // TODO: BFS; record the last node processed per level
  return [];
}

// Return level-order values alternating left-to-right and right-to-left.
export function zigzagLevelOrder(root: TreeNode | null): number[][] {
  // TODO: BFS with a direction flag; use index-based fill into a pre-sized array
  return [];
}

// Usage example (uncomment to test manually):
// const t = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
// console.log(levelOrder(t));       // [[3],[9,20],[15,7]]
// console.log(rightSideView(t));    // [3,20,7]
// console.log(zigzagLevelOrder(t)); // [[3],[20,9],[15,7]]
