// Run: tsx exemplar.ts

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

export function levelOrder(root: TreeNode | null): number[][] {
  if (root === null) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length; // snapshot before inner loop
    const level: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

export function rightSideView(root: TreeNode | null): number[] {
  if (root === null) return [];
  const result: number[] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      if (i === levelSize - 1) result.push(node.val); // last = rightmost
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return result;
}

export function zigzagLevelOrder(root: TreeNode | null): number[][] {
  if (root === null) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  let leftToRight = true;

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = new Array<number>(levelSize); // pre-sized for index fill

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      // Mirror the index when going right-to-left
      const idx = leftToRight ? i : levelSize - 1 - i;
      level[idx] = node.val;
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
    leftToRight = !leftToRight;
  }
  return result;
}
