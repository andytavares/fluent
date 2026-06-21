"use client";

import { AlgorithmVisualizer } from "@fluent/ui";

const VISUALIZERS: { slug: string; title: string; description: string }[] = [
  { slug: "two-pointers", title: "Two Pointers", description: "Converge from both ends of a sorted array — O(n)" },
  { slug: "sliding-window", title: "Sliding Window", description: "Track a contiguous subarray with a fixed or variable window" },
  { slug: "prefix-sums", title: "Prefix Sums", description: "Precompute cumulative sums for O(1) range queries" },
  { slug: "binary-search", title: "Binary Search", description: "Halve the search space each step — O(log n)" },
  { slug: "hash-maps-and-sets", title: "Hash Maps & Sets", description: "O(1) average insert/lookup using key hashing" },
  { slug: "stacks", title: "Stacks", description: "LIFO structure — push to top, pop from top" },
  { slug: "queues-and-deques", title: "Queues & Deques", description: "FIFO structure — enqueue at back, dequeue from front" },
  { slug: "linked-list-patterns", title: "Linked List: Fast & Slow Pointers", description: "Floyd's cycle detection algorithm" },
  { slug: "tree-dfs", title: "Tree DFS", description: "Pre-order depth-first traversal via recursion" },
  { slug: "tree-bfs", title: "Tree BFS", description: "Level-order traversal using a queue" },
  { slug: "binary-search-trees", title: "Binary Search Trees", description: "Insert and search using the BST ordering property" },
  { slug: "heaps-and-priority-queues", title: "Heaps & Priority Queues", description: "Min-heap: insert + sift-up to maintain heap property" },
  { slug: "graphs-bfs-dfs", title: "Graphs: BFS & DFS", description: "Toggle between breadth-first and depth-first graph traversal" },
  { slug: "greedy-algorithms", title: "Greedy: Merge Intervals", description: "Sort by start, merge overlapping intervals greedily" },
  { slug: "dynamic-programming-1d", title: "Dynamic Programming: 1D", description: "Climbing stairs — Fibonacci-style DP table fill" },
  { slug: "backtracking", title: "Backtracking", description: "Generate all permutations via choose → explore → unchoose" },
  { slug: "tries", title: "Tries", description: "Prefix tree — O(m) insert and search where m = word length" },
  { slug: "union-find", title: "Union-Find", description: "Disjoint sets with path compression and union by rank" },
  { slug: "dynamic-programming-2d", title: "Dynamic Programming: 2D", description: "Longest common subsequence via bottom-up DP table" },
];

export default function VisualizerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Algorithm Visualizer</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Step through all 19 core patterns. Use Play to animate or step through manually.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {VISUALIZERS.map(({ slug, title, description }) => (
          <div key={slug} className="flex flex-col gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">{description}</p>
            </div>
            <AlgorithmVisualizer conceptSlug={slug} />
          </div>
        ))}
      </div>
    </main>
  );
}
