# DSA track curriculum — Top Interview 150 coverage

The four `dsa-*` tracks (javascript, typescript, python, java) share this
curriculum: 23 pattern concepts that together cover all 150 problems of the
canonical "Top Interview 150" interview list. `dsa-javascript` is the source
of truth; the other tracks are idiomatic ports with identical structure.

Every concept lesson contains:

1. **Pattern teaching** — the technique, when it applies, complexity, and the
   template code for its canonical forms.
2. **Problem walkthroughs** — a step-by-step implementation guide for *every*
   catalog problem in the group (original problem descriptions written for
   this platform, one worked example, numbered implementation steps,
   complexity). This is where the full 150 coverage lives.
3. **`## The task`** — the group's flagship problems (2–4), fully specified
   with sample I/O, backed by the concept's test suite and a test-out variant
   (`has_testout: true` for all DSA concepts).

Flagship problems (coded + tested) are marked ★.

| # | Slug | Title | Catalog problems |
|---|------|-------|------------------|
| 1 | array-string | Arrays & Strings | Merge Sorted Array ★, Remove Element, Remove Duplicates from Sorted Array ★, Remove Duplicates from Sorted Array II, Majority Element ★, Rotate Array ★, Best Time to Buy and Sell Stock, Best Time to Buy and Sell Stock II, Jump Game, Jump Game II, H-Index, Insert Delete GetRandom O(1), Product of Array Except Self, Gas Station, Candy, Trapping Rain Water, Roman to Integer, Integer to Roman, Length of Last Word, Longest Common Prefix, Reverse Words in a String, Zigzag Conversion, Find the Index of the First Occurrence in a String, Text Justification |
| 2 | two-pointers | Two Pointers | Valid Palindrome ★, Is Subsequence, Two Sum II ★, Container With Most Water ★, 3Sum ★ |
| 3 | sliding-window | Sliding Window | Minimum Size Subarray Sum ★, Longest Substring Without Repeating Characters ★, Substring with Concatenation of All Words, Minimum Window Substring ★ |
| 4 | matrix | Matrix | Valid Sudoku ★, Spiral Matrix ★, Rotate Image ★, Set Matrix Zeroes, Game of Life |
| 5 | hash-maps-and-sets | Hash Maps | Ransom Note, Isomorphic Strings, Word Pattern, Valid Anagram ★, Group Anagrams ★, Two Sum ★, Happy Number, Contains Duplicate II, Longest Consecutive Sequence ★ |
| 6 | intervals | Intervals | Summary Ranges, Merge Intervals ★, Insert Interval ★, Minimum Number of Arrows to Burst Balloons ★ |
| 7 | stacks | Stack | Valid Parentheses ★, Simplify Path, Min Stack ★, Evaluate Reverse Polish Notation ★, Basic Calculator |
| 8 | linked-list-patterns | Linked List | Linked List Cycle ★, Add Two Numbers ★, Merge Two Sorted Lists ★, Copy List with Random Pointer, Reverse Linked List II ★, Reverse Nodes in k-Group, Remove Nth Node From End of List, Remove Duplicates from Sorted List II, Rotate List, Partition List, LRU Cache |
| 9 | tree-dfs | Binary Tree | Maximum Depth of Binary Tree ★, Same Tree ★, Invert Binary Tree ★, Symmetric Tree, Construct Binary Tree from Preorder and Inorder Traversal, Construct Binary Tree from Inorder and Postorder Traversal, Populating Next Right Pointers in Each Node II, Flatten Binary Tree to Linked List, Path Sum ★, Sum Root to Leaf Numbers, Binary Tree Maximum Path Sum, Binary Search Tree Iterator, Count Complete Tree Nodes, Lowest Common Ancestor of a Binary Tree |
| 10 | tree-bfs | Tree BFS | Binary Tree Right Side View ★, Average of Levels in Binary Tree, Binary Tree Level Order Traversal ★, Binary Tree Zigzag Level Order Traversal ★ |
| 11 | binary-search-trees | Binary Search Tree | Minimum Absolute Difference in BST ★, Kth Smallest Element in a BST ★, Validate Binary Search Tree ★ |
| 12 | graphs-bfs-dfs | Graphs | Number of Islands ★, Surrounded Regions, Clone Graph ★, Evaluate Division, Course Schedule ★, Course Schedule II |
| 13 | graph-bfs | Graph BFS | Snakes and Ladders, Minimum Genetic Mutation ★, Word Ladder ★ |
| 14 | tries | Trie | Implement Trie (Prefix Tree) ★, Design Add and Search Words Data Structure ★, Word Search II |
| 15 | backtracking | Backtracking | Letter Combinations of a Phone Number ★, Combinations, Permutations ★, Combination Sum ★, N-Queens II, Generate Parentheses ★, Word Search |
| 16 | divide-and-conquer | Divide & Conquer | Convert Sorted Array to Binary Search Tree ★, Sort List ★, Construct Quad Tree, Merge k Sorted Lists ★ |
| 17 | kadane | Kadane's Algorithm | Maximum Subarray ★, Maximum Sum Circular Subarray ★ |
| 18 | binary-search | Binary Search | Search Insert Position ★, Search a 2D Matrix, Find Peak Element ★, Search in Rotated Sorted Array ★, Find First and Last Position of Element in Sorted Array ★, Find Minimum in Rotated Sorted Array, Median of Two Sorted Arrays |
| 19 | heaps-and-priority-queues | Heap / Priority Queue | Kth Largest Element in an Array ★, IPO, Find K Pairs with Smallest Sums ★, Find Median from Data Stream ★ |
| 20 | bit-manipulation | Bit Manipulation | Add Binary ★, Reverse Bits, Number of 1 Bits ★, Single Number ★, Single Number II, Bitwise AND of Numbers Range ★ |
| 21 | math | Math | Palindrome Number ★, Plus One ★, Factorial Trailing Zeroes, Sqrt(x) ★, Pow(x, n) ★, Max Points on a Line |
| 22 | dynamic-programming-1d | Dynamic Programming: 1D | Climbing Stairs ★, House Robber ★, Word Break ★, Coin Change ★, Longest Increasing Subsequence ★ |
| 23 | dynamic-programming-2d | Dynamic Programming: Multidimensional | Triangle, Minimum Path Sum ★, Unique Paths II ★, Longest Palindromic Substring ★, Interleaving String, Edit Distance ★, Best Time to Buy and Sell Stock III, Best Time to Buy and Sell Stock IV, Maximal Square ★ |

Total: 24+5+4+5+9+4+5+11+14+4+3+6+3+3+7+4+2+7+4+6+6+5+9 = **150 problems**.

## Problem walkthrough format (inside each lesson)

```markdown
### <Problem name>

**Problem.** Original-phrasing description with input/output types.

**Example.**
    input  → output       (one or two concrete cases)

**Steps.**
1. Numbered, implementation-level steps a learner can follow directly.
2. Each step says *what* to write and *why* it works.
3. End with the invariant or insight that makes the solution correct.

**Complexity.** O(...) time / O(...) space, one sentence on why.
```

## Notes for authors

- Problem descriptions are written originally for this platform — never copy
  third-party problem text.
- Linked list / tree problems: the lesson defines the node representation the
  tests use (plain objects/arrays — no framework).
- Slugs are reused from the previous 19-concept tracks wherever the pattern
  maps 1:1; four old concepts (prefix-sums, queues-and-deques, union-find,
  greedy-algorithms) are removed — their material lives on inside
  array-string, intervals, and stacks where the catalog puts those problems.
- Folder numbering follows the table (01-array-string … 23-dynamic-programming-2d).
