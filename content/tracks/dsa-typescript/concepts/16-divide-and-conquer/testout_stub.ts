// Node representations:
//   binary tree node: { val, left, right }   (absent children are null)
//   linked list node: { val, next }          (last node's next is null)

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export interface ListNode {
  val: number;
  next: ListNode | null;
}

export function sortedArrayToBST(nums: number[]): TreeNode | null {
  return null;
}

export function sortList(head: ListNode | null): ListNode | null {
  return null;
}

export function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
  return null;
}
