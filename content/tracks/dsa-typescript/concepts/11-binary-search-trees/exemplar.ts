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

export function isValidBST(root: TreeNode | null): boolean {
  function validate(node: TreeNode | null, min: number, max: number): boolean {
    if (node === null) return true;
    if (node.val <= min || node.val >= max) return false;
    return (
      validate(node.left, min, node.val) &&
      validate(node.right, node.val, max)
    );
  }
  return validate(root, -Infinity, Infinity);
}

export function kthSmallest(root: TreeNode | null, k: number): number {
  let count = 0;
  let result = 0;

  function inorder(node: TreeNode | null): void {
    if (node === null || count >= k) return;
    inorder(node.left);
    count++;
    if (count === k) { result = node.val; return; }
    inorder(node.right);
  }

  inorder(root);
  return result;
}

export function buildBSTFromPreorder(preorder: number[]): TreeNode | null {
  let idx = 0;

  function build(maxVal: number): TreeNode | null {
    if (idx === preorder.length || preorder[idx] > maxVal) return null;

    const root = new TreeNode(preorder[idx++]);
    root.left  = build(root.val);  // left subtree: values < root.val
    root.right = build(maxVal);    // right subtree: values < maxVal (outer bound)
    return root;
  }

  return build(Infinity);
}
