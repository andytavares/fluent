## What you build

You write `minMutation` and `ladderLength`, two shortest-path searches over graphs that nobody hands you. The Graphs concept used BFS to reach things; this lesson uses BFS to reach things in the fewest moves. This lesson builds on **Graphs: BFS and DFS**.

## Key concepts

### BFS finds shortest paths in unweighted graphs

BFS explores in rings: every node one edge away, then two, then three. The first time it reaches a node, it reaches it by a shortest path. DFS finds a path; BFS finds a shortest one.

The queue processes states in non-decreasing distance from the start. When the target leaves the queue, or when you first generate it, no shorter route to it exists.

This holds only when every edge costs the same: one mutation, one roll, one letter change. When edges have different weights, you need Dijkstra's algorithm. Say that in the interview.

You can track the distance in two equivalent ways:

```ts
// 1. Store the distance with each state
const queue: [string, number][] = [
  [start, 0],
];
let head = 0;
while (head < queue.length) {
  const [state, dist] = queue[head++];
  if (state === target) return dist;
  for (const next of neighbors(state)) {
    // push [next, dist + 1]
  }
}

// 2. The level loop from Tree BFS:
// snapshot the queue length, and add 1
// to one counter per level
```

Both are standard. When states are strings, a state paired with its distance usually reads better.

### An implicit graph is states and moves

Nobody gives you an adjacency list for "all 8-character gene strings". The graph exists only through a `neighbors(state)` function. A state is a node, and one legal move is an edge.

| Problem | State | One edge |
|---------|-------|----------|
| Snakes and Ladders | the board square you stand on | one die roll, then a forced snake or ladder |
| Minimum Genetic Mutation | an 8-character gene string | change one character to A, C, G or T; the result must be in the bank |
| Word Ladder | a dictionary word | change one letter; the result must be in the word list |

Model the state graph and generate neighbors when you need them. The shortest-path machinery then stays the same every time.

### Generate neighbors by substitution, not by a dictionary scan

Do not scan the whole dictionary for each state; that compares O(list²) pairs. Generate candidates instead: put each alphabet letter at each position, and test membership in a set. That gives `L × 26` candidates per word, and each check is an O(1) lookup.

```ts
const abc = "abcdefghijklmnopqrstuvwxyz";
for (let i = 0; i < word.length; i++) {
  for (const ch of abc) {
    if (ch === word[i]) continue;
    const next = word.slice(0, i) + ch
      + word.slice(i + 1);
    if (wordSet.has(next)) {
      // next is a neighbor
    }
  }
}
```

### Mark a state visited when you enqueue it

This is the rule from the Graphs concept, and here it matters more. In a state graph, many states in the same level often reach one state. If you mark a state only when you pop it, each predecessor pushes its own copy first. The queue then grows combinatorially.

Mark the state, or delete it from the candidate set, at the moment you push it:

```ts
if (wordSet.has(next)) {
  // Visited: nothing queues it again
  wordSet.delete(next);
  queue.push([next, dist + 1]);
}
```

The delete does two jobs. It acts as the visited set, and it makes future neighbor checks smaller. It is safe because BFS already reached that state by a shortest route, so no later path to it is better.

### Complexity of the flagship problems

| Problem | Time | Space |
|---------|------|-------|
| Minimum Genetic Mutation | O(B · L · 4): B bank size, L = 8 | O(B) |
| Word Ladder | O(N · L² · 26): N words, L word length | O(N · L) |
| Snakes and Ladders | O(n²) squares × 6 rolls | O(n²) |

The extra L in the Word Ladder time is string slicing: each candidate costs O(L) to build.

## Watch out

- Word Ladder counts words in the sequence. `hit → hot → dot → dog → cog` is 5.
- Minimum Genetic Mutation counts mutations, which are edges. A chain of that shape is 4.
- This off-by-one is the most common wrong answer on both problems.
- The target must be in the bank or word list. If it is not, return -1 or 0 before any search.
- The start string does not need to be in the bank or word list.
- `start === end` is 0 mutations, whatever the bank holds. Handle it before the search.
- Do not compare every pair of words to build the graph. That costs O(N² · L) before the search starts.
- If you mark states when you pop them, each incoming edge queues the state again. Dense word graphs then time out.
- Strings in TypeScript are immutable, so you cannot write one character in place.
- Build a candidate with `slice(0, i) + ch + slice(i + 1)`, or split to an array, swap and join.
- With weighted edges, BFS does not give shortest paths. Use Dijkstra's algorithm there.

## Problem walkthroughs

### Snakes and Ladders

**Problem.** An `n × n` board numbers its squares `1 … n²` in boustrophedon order. Numbering starts at the bottom-left and runs left to right. The row above runs right to left, and the direction alternates upward.

`board[r][c]` is `-1` for a normal square. Otherwise it is the square a snake or ladder sends you to. Each move goes forward by a die roll of 1–6.

If the destination has a snake or ladder, you must take it. You never take a second one in the same move. Start on square 1. Return the minimum number of rolls to reach square `n²`, or `-1` if you cannot reach it.

**Example.**

```text
board = [[-1,-1],
         [-1, 3]] → 1
```

The squares are 1 to 4, and square 2 holds a ladder to 3. Roll 1 and then 1: you use the ladder, but it costs 2 moves. A roll of 3 reaches square 4 = n² in one move.

**Steps.**
1. The fiddly part is to map a square number to `(row, col)`. Let `q = floor((square - 1) / n)` and `rem = (square - 1) % n`.
2. The row is `n - 1 - q`, counted from the top of the matrix. The column is `rem` when `q` is even and `n - 1 - rem` when `q` is odd, because the direction alternates per row.
3. Run BFS over the square numbers 1 … n²; the distance is the number of rolls. Start from square 1, with 1 in the visited set.
4. For each square you dequeue, try the six destinations `square + 1 … square + 6`, capped at n². Look up each one on the board. If it holds a snake or ladder, replace the destination with its target, once.
5. Return the distance when you dequeue or generate n². Return -1 if the queue empties. BFS gives the minimum because every roll costs exactly one, however far it moves.

**Complexity.** O(n²) time, because each square leaves the queue once with six rolls each / O(n²) space.

### Minimum Genetic Mutation ★

**Problem.** A gene is an 8-character string over `A`, `C`, `G`, `T`. One mutation changes exactly one character. Every intermediate gene and the final gene must appear in `bank`, an array of valid genes.

Return the minimum number of mutations from `startGene` to `endGene`, or `-1` if no route exists. `startGene` does not need to be in the bank.

**Example.**

```text
"AACCGGTT" → "AACCGGTA"
bank = ["AACCGGTA"] → 1

"AACCGGTT" → "AAACGGTA"
bank = ["AACCGGTA", "AACCGCTA",
        "AAACGGTA"] → 2
```

**Steps.**
1. If `startGene === endGene`, return 0. Put the bank in a set. If `endGene` is not in it, return -1 at once.
2. Run BFS from `startGene`. Pair each queued gene with its mutation count.
3. Neighbors: at each of the 8 positions, try the 3 other nucleotides. Keep the candidates that are in the bank set. Delete each candidate from the set as you enqueue it.
4. Return the count when you generate `endGene`: its distance is the parent's distance + 1. Return -1 when the queue empties. The answer counts edges, because each mutation is one step.

**Complexity.** O(B · 32) ≈ O(B) time: 8 positions × 4 letters per gene, with O(1) bank lookups / O(B) space.

### Word Ladder ★

**Problem.** A transformation sequence from `beginWord` to `endWord` is a chain of words. Each word differs from the one before it by exactly one letter. Every word after `beginWord` must be in `wordList`.

Return the number of words in the shortest sequence, both endpoints included. Return `0` if no sequence exists.

**Example.**

```text
"hit" → "cog"
wordList = ["hot","dot","dog",
            "lot","log","cog"] → 5
(hit → hot → dot → dog → cog)

"hit" → "cog"
wordList = ["hot","dot","dog",
            "lot","log"] → 0
(cog is not in the list)
```

**Steps.**
1. Build a set from `wordList`. If `endWord` is missing, return 0.
2. Run BFS from `beginWord` with distance 1. The length counts words, and the chain already holds `beginWord`.
3. Generate neighbors by substitution: every position × every letter `a-z`. Keep candidates that are in the set, and delete each one on enqueue.
4. When a generated candidate equals `endWord`, return the parent's length + 1. A check at dequeue gives the same answer.
5. Return 0 if the search ends without it.
6. Minimum Genetic Mutation uses the same algorithm. This problem returns nodes in the path; that one returns edges. Read the counting rule from the examples before you code.

**Complexity.** O(N · L² · 26) time: N list words, L letters each, O(L) to build each candidate / O(N · L) space.

## Interview follow-ups

- After **Word Ladder**: "Return all shortest sequences (Word Ladder II)?" Run BFS level by level and record the predecessors of each word. Then backtrack from `endWord`; do not run DFS from scratch.
- After **Word Ladder**: "Speed it up?" Use bidirectional BFS and expand the smaller frontier. The searches meet in the middle, and the exponent halves.
- After **Minimum Genetic Mutation**: "A bank of millions of genes?" Substitution already makes the cost linear in bank size. Beyond that, precompute wildcard buckets such as `A*CCGGTT` to group neighbors.
- After **Snakes and Ladders**: "Why not always roll 6?" A ladder you skip can save more rolls than the largest step. Only an exhaustive level-order search is safe.
- General: "When does BFS stop being the answer?" Weighted moves need Dijkstra's algorithm. A state space too large to list needs A* with a heuristic, or meet-in-the-middle.

## The task

Write two shortest-path searches over implicit graphs. An implicit graph has no adjacency list: you generate the neighbors of a state when you need them. Every move costs 1, and each function returns the minimum.

1. `minMutation(startGene: string, endGene: string, bank: string[]): number` returns the minimum number of mutations from `startGene` to `endGene`.
2. A gene is an 8-character string over `A`, `C`, `G` and `T`. One mutation changes exactly one character.
3. Every gene you mutate into must be in `bank`, an array of gene strings. This includes `endGene`.
4. `minMutation` counts mutations (edges), not genes. It returns `-1` if no route exists.
5. `ladderLength(beginWord: string, endWord: string, wordList: string[]): number` returns the number of words in the shortest transformation sequence.
6. A transformation sequence is `beginWord → w₁ → … → endWord`. Consecutive words differ in exactly one letter.
7. Every word after `beginWord` must be in `wordList`. The count includes both endpoints.
8. `ladderLength` returns `0` if no sequence exists.

BFS that marks a state visited when it enters the queue is the expected shape.

Edge cases:

- `startGene` does not need to be in the bank.
- If `startGene === endGene`, `minMutation` returns `0`, even with an empty bank.
- If `endGene` is not in the bank, `minMutation` returns `-1`.
- A bank can hold `endGene` and still have no path. Return `-1`.
- When several routes exist, only the shortest counts.
- All words have the same length and use lowercase letters. `beginWord` differs from `endWord`.
- `beginWord` does not need to be in `wordList`.
- If `endWord` is not in `wordList`, `ladderLength` returns `0`.
- Two words that differ by one letter give `2`: two words, one change.
- Both endpoints can be valid words with no path between them. Return `0`.
- Words can have one letter.
- An all-pairs neighbor scan is too slow for long lists. Generate neighbors by letter substitution against a set.

```ts
minMutation("AACCGGTT", "AACCGGTA",
  ["AACCGGTA"])                    // 1
minMutation("AACCGGTT", "AAACGGTA",
  ["AACCGGTA", "AACCGCTA",
   "AAACGGTA"])                    // 2
minMutation("AACCGGTT", "AACCGGTT",
  [])                              // 0
// End gene not in the bank
minMutation("AACCGGTT", "AACCGGTA",
  [])                              // -1

ladderLength("hit", "cog",
  ["hot", "dot", "dog",
   "lot", "log", "cog"])           // 5
ladderLength("hit", "cog",
  ["hot", "dot", "dog",
   "lot", "log"])                  // 0
ladderLength("a", "c",
  ["a", "b", "c"])                 // 2
ladderLength("hot", "dog",
  ["hot", "dog"])                  // 0
ladderLength("red", "tad",
  ["ted", "tad"])                  // 3
```
