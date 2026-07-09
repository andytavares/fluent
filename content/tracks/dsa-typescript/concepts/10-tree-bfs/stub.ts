// Run: tsx stub.ts
//
// Binary tree nodes are plain objects: { val, left, right }.
// left/right are child nodes or null; an empty tree is null.

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/** Returns node values grouped by depth, top to bottom, left to right. */
export function levelOrder(root: TreeNode | null): number[][] {
  // TODO: queue BFS; snapshot the queue length before draining each level
  // so children pushed mid-level land in the *next* level
  return [];
}

/** Returns the rightmost node value at each depth, top to bottom. */
export function rightSideView(root: TreeNode | null): number[] {
  // TODO: same level loop; record only the value drained last in each level
  // (not the right spine — a left-subtree node can be visible)
  return [];
}

/** Returns the level order traversal with alternating direction per level. */
export function zigzagLevelOrder(root: TreeNode | null): number[][] {
  // TODO: enqueue left-then-right at every depth; reverse the collected
  // level array on odd depths (never reorder the queue itself)
  return [];
}

function node(val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return { val, left, right };
}

function main(): void {
  const root = node(3, node(9), node(20, node(15), node(7)));
  console.log(JSON.stringify(levelOrder(root)));       // [[3],[9,20],[15,7]]
  console.log(JSON.stringify(rightSideView(root)));    // [3,20,7]
  console.log(JSON.stringify(zigzagLevelOrder(root))); // [[3],[20,9],[15,7]]
}

main();
