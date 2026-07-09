# Graph BFS

## What you'll learn

The Graphs concept used BFS to *reach* things; this one uses it to reach things **in the fewest moves**. BFS explores an unweighted graph in expanding rings — everything one edge away, then two, then three — so the first time it touches a node is via a shortest path. The interview twist: the graph is almost never handed to you. Board positions, gene strings, and dictionary words are all *states*, and one legal move is an *edge*. Model the state graph, generate neighbors on the fly, and the shortest-path machinery is the same every time.

## Key concepts

### BFS finds shortest paths in unweighted graphs

DFS finds *a* path; BFS finds a *shortest* one. The queue processes states in non-decreasing distance from the start, so when the target is dequeued (or first generated), no shorter route to it can exist. This only holds when every edge costs the same — one mutation, one roll, one letter change. The moment edges have different weights you need Dijkstra instead; say that in the interview.

Pair each queued state with its distance in a small helper class (Java has no tuple literal, so a `State(value, steps)` holder plays that role):

```java
private static class State {
    final String value;
    final int steps;
    State(String value, int steps) { this.value = value; this.steps = steps; }
}

var queue = new ArrayDeque<State>();
queue.offer(new State(start, 0));
while (!queue.isEmpty()) {
    State cur = queue.poll();
    if (cur.value.equals(target)) return cur.steps;
    for (String next : neighbors(cur.value)) { /* queue.offer(new State(next, cur.steps + 1)); */ }
}
```

The level-loop style from Tree BFS (snapshot `queue.size()`, increment one counter per level) is an equally standard alternative when you don't need per-state distances tracked individually.

### Implicit graphs: states and moves

Nobody gives you an adjacency list for "all 8-character gene strings". The graph exists only through a `neighbors(state)` function:

| Problem | State | One edge |
|---------|-------|----------|
| Snakes and Ladders | board square you stand on | one die roll (then forced snake/ladder) |
| Minimum Genetic Mutation | 8-char gene string | change one char to A/C/G/T, result must be in the bank |
| Word Ladder | dictionary word | change one letter, result must be in the word list |

The craft is in neighbor generation. For strings, don't scan the whole dictionary per state (O(list²) pairs) — *generate* candidates by substituting each position with each alphabet letter and test membership in a `HashSet`: `L × 26` candidates per word, each an O(1) lookup. Java `String`s are immutable like JavaScript's, so build each candidate from a mutable `char[]`, flip one slot, and construct a fresh `String`:

```java
char[] chars = word.toCharArray();
for (int i = 0; i < chars.length; i++) {
    char original = chars[i];
    for (char ch = 'a'; ch <= 'z'; ch++) {
        if (ch == original) continue;
        chars[i] = ch;
        String next = new String(chars);
        if (wordSet.contains(next)) { /* next is a neighbor */ }
    }
    chars[i] = original; // restore before moving to the next position
}
```

### Mark visited at enqueue, never at dequeue

The rule from the Graphs concept, now with teeth: in a state graph, a state is often reachable from many predecessors in the *same* level. If you only mark states when you pop them, every predecessor pushes its own copy first and the queue balloons combinatorially. Mark (or remove from the candidate set) the moment you push:

```java
if (wordSet.contains(next)) {
    wordSet.remove(next);           // visited — nothing re-queues it
    queue.offer(new State(next, cur.steps + 1));
}
```

Removing from the word/gene set does double duty: it is the visited set, and it shrinks future neighbor checks. Safe because BFS already reached that state by a shortest route — any later path to it is no better.

### Complexity of the flagship problems

| Problem | Time | Space |
|---------|------|-------|
| Minimum Genetic Mutation | O(B · L · 4) — B bank size, L = 8 | O(B) |
| Word Ladder | O(N · L² · 26) — N words, L word length | O(N · L) |
| Snakes and Ladders | O(n²) squares × 6 rolls | O(n²) |

(The extra L in Word Ladder's time is string construction — each candidate build costs O(L).)

## vs other languages

Java has no tuple or list-destructuring literal (`const [state, dist] = queue.shift()` in JS), so pairing a state with its distance needs a small holder class (or two parallel data structures) instead of an inline array/tuple. `String` immutability matches JavaScript's — both need a fresh string per candidate — but Java's `char[]` in-place mutation followed by `new String(chars)` per candidate is the idiomatic way to avoid repeated `substring` concatenation.

## Watch out

- **Count the right thing.** Word Ladder counts *words in the sequence* (`hit → hot → dot → dog → cog` = **5**); Minimum Genetic Mutation counts *mutations*, i.e. edges (that same shape of chain would be 4). Off-by-one here is the most common wrong answer on both.
- **The target must be in the bank / word list.** If it isn't, the answer is -1 / 0 — check up front and skip the whole search. The *start* string, by contrast, does not need to be listed.
- **`startGene.equals(endGene)`** is 0 mutations regardless of the bank. Handle it before searching — and use `.equals()`, never `==`, for string comparison.
- **Don't compare every pair of words** to build the graph — that's O(N² · L) before the search starts. Generate candidate neighbors by substitution against a `HashSet`.
- **Visited on push.** Popping before marking re-queues states once per incoming edge; on dense word graphs that's the difference between milliseconds and a timeout.
- **Restore the original character** after trying all 26 substitutions at a position (`chars[i] = original`) — forgetting this corrupts every subsequent candidate built from the same array.
- **Unweighted only.** BFS's shortest-path guarantee dies with weighted edges — reach for Dijkstra there.

## Problem walkthroughs

### Snakes and Ladders

**Problem.** An `n × n` board has squares numbered `1 … n²` boustrophedon-style: starting at the bottom-left, left-to-right, then right-to-left on the row above, alternating upward. `board[r][c]` is `-1` for a normal square, or the square you are teleported to (a snake or ladder). From your current square you move forward by a die roll of 1–6; if the destination has a snake/ladder you *must* take it (but you never take a second one in the same move). Starting on square 1, return the minimum number of rolls to reach square `n²`, or `-1` if unreachable.

**Example.**

    board = [[-1,-1],
             [-1, 3]]   →  1   (squares 1..4; square 2 holds a ladder to 3.
                                Rolling 1 then 1 uses the ladder but costs 2 moves;
                                rolling 3 reaches square 4 = n² in a single move)

**Steps.**
1. The only genuinely fiddly part is mapping a square number to `(row, col)`: with `q = (square - 1) / n` and `rem = (square - 1) % n`, the row is `n - 1 - q` (counting from the top of the matrix) and the column is `q` even ? `rem` : `n - 1 - rem` (direction alternates per row).
2. BFS over square numbers 1 … n², distance = rolls used. Start from square 1, visited set containing 1.
3. For each dequeued square, try the six destinations `square + 1 … square + 6` (capped at n²). Look each up on the board; if it holds a snake/ladder, replace the destination with it — once.
4. Return the distance when n² is dequeued or generated; -1 if the queue drains. BFS gives the minimum because every roll costs exactly one, no matter how far it advances.

**Complexity.** O(n²) time (each square dequeued once, six rolls each) / O(n²) space.

### Minimum Genetic Mutation ★

**Problem.** A gene is an 8-character string over `A`, `C`, `G`, `T`. One mutation changes exactly one character, and every intermediate (and final) gene must appear in `bank`, an array of valid genes. Return the minimum number of mutations to get from `startGene` to `endGene`, or `-1` if impossible. `startGene` need not be in the bank.

**Example.**

    "AACCGGTT" → "AACCGGTA", bank = ["AACCGGTA"]                             →  1
    "AACCGGTT" → "AAACGGTA", bank = ["AACCGGTA", "AACCGCTA", "AAACGGTA"]     →  2

**Steps.**
1. If `startGene.equals(endGene)`, return 0. Put the bank in a `HashSet`; if `endGene` isn't in it, return -1 immediately.
2. BFS from `startGene`, pairing each queued gene with its mutation count.
3. Neighbors: for each of the 8 positions, try the 3 other nucleotides; keep candidates present in the bank set. Remove a candidate from the set as you enqueue it — visited-on-push.
4. Return the count when `endGene` is generated (its distance is the parent's + 1); -1 when the queue empties. The answer counts **edges** — each mutation is one step.

**Complexity.** O(B · 32) ≈ O(B) time — 8 positions × 4 letters per gene, bank lookups O(1) / O(B) space.

### Word Ladder ★

**Problem.** A transformation sequence from `beginWord` to `endWord` is a chain of words, each differing from the previous by exactly one letter, where every word after `beginWord` must be in `wordList`. Return the **number of words** in the shortest such sequence (including both endpoints), or `0` if none exists.

**Example.**

    "hit" → "cog", wordList = ["hot","dot","dog","lot","log","cog"]  →  5
        (hit → hot → dot → dog → cog)
    "hit" → "cog", wordList = ["hot","dot","dog","lot","log"]        →  0
        (cog is not in the list)

**Steps.**
1. Build a `HashSet` from `wordList`; if `endWord` is missing, return 0.
2. BFS from `beginWord` with distance 1 — the sequence length counts *words*, and the chain already contains `beginWord`.
3. Neighbors by substitution: every position × every letter `a-z`, keep candidates in the set, remove on enqueue.
4. When a generated candidate equals `endWord`, return the parent's length + 1 (or dequeue-check, same thing).
5. Return 0 if the search exhausts. Compare with Minimum Genetic Mutation: identical algorithm, but this one returns nodes-in-path and that one returns edges — read the counting convention off the examples before you code.

**Complexity.** O(N · L² · 26) time — N list words, L letters each, O(L) to build each candidate / O(N · L) space.

## Interview follow-ups

- After **Word Ladder**: "Return *all* shortest sequences (Word Ladder II)?" (BFS level by level recording each word's predecessors, then backtrack from `endWord` — don't DFS from scratch.) "Speed it up?" (bidirectional BFS — expand the smaller frontier; the search meets in the middle and the exponent halves.)
- After **Minimum Genetic Mutation**: "Bank of millions of genes?" (the substitution trick already makes cost linear in bank size; beyond that, precompute wildcard buckets like `A*CCGGTT` to group neighbors.)
- After **Snakes and Ladders**: "Why can't you just greedily roll 6?" (a ladder you skip may save more rolls than maximal advancement — only exhaustive level-order search is safe.)
- General: "When does BFS stop being the answer?" — weighted moves (Dijkstra), state too large to enumerate (A* with a heuristic, or meet-in-the-middle).

## The task

Two shortest-path searches over implicit graphs. Both must treat every move as cost 1 and return the minimum — a BFS with visited-on-enqueue is the expected shape.

### `minMutation(String startGene, String endGene, String[] bank)`

Genes are 8-character strings over the alphabet `A`, `C`, `G`, `T`. One mutation changes exactly one character. Every gene you mutate *into* — including `endGene` — must be a member of `bank`; `startGene` itself does not need to be in the bank. Return the minimum number of **mutations** (edges, not genes) to turn `startGene` into `endGene`, or `-1` if it cannot be done. If `startGene` equals `endGene`, return `0`.

```java
minMutation("AACCGGTT", "AACCGGTA", new String[]{"AACCGGTA"});                              // 1
minMutation("AACCGGTT", "AAACGGTA", new String[]{"AACCGGTA", "AACCGCTA", "AAACGGTA"});      // 2
minMutation("AACCGGTT", "AACCGGTT", new String[]{});                                         // 0
minMutation("AACCGGTT", "AACCGGTA", new String[]{});                                         // -1  (end not in bank)
```

Edge cases: start equals end (0, even with an empty bank), `endGene` absent from the bank (-1), a bank that contains genes but no path (-1), multiple routes where only the shortest counts, the direct one-step mutation.

### `ladderLength(String beginWord, String endWord, List<String> wordList)`

All words have the same length and use lowercase letters; `beginWord` does not equal `endWord`. A transformation sequence is `beginWord → w₁ → … → endWord` where consecutive words differ in exactly one letter and every word after `beginWord` is in `wordList` (`beginWord` itself need not be). Return the **number of words** in the shortest sequence — both endpoints included — or `0` if no sequence exists.

```java
ladderLength("hit", "cog", List.of("hot", "dot", "dog", "lot", "log", "cog"));  // 5
ladderLength("hit", "cog", List.of("hot", "dot", "dog", "lot", "log"));         // 0
ladderLength("a", "c", List.of("a", "b", "c"));                                 // 2
```

Edge cases: `endWord` missing from the list (0), adjacent begin/end words (2 — two words, one change), no path even though both endpoints are valid words, single-letter words, longer lists where the naive all-pairs neighbor scan is too slow — generate neighbors by letter substitution against a `HashSet`.
