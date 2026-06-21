# Graphs: BFS and DFS

## What you'll learn

How to represent graphs in Python for interview problems, how DFS on a grid counts connected components, how DFS on a directed graph detects cycles (Course Schedule), and how BFS finds the minimum number of transformations (Word Ladder).

## Key concepts

**Graph representations:**
- **Adjacency list:** `defaultdict(list)` — standard for sparse graphs
- **Grid:** `list[list[str]]` where neighbors are up/down/left/right — most common in FAANG
- **Implicit graph:** edges defined by problem rules (words differing by one letter)

### DFS — num_islands (grid connected components)

Flood-fill each unvisited land cell. Marking visited by mutating `"1"` to `"0"` avoids a separate `visited` set.

```python
def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    islands = 0

    def dfs(r: int, c: int) -> None:
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"         # mark visited
        dfs(r + 1, c); dfs(r - 1, c)
        dfs(r, c + 1); dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                dfs(r, c)
                islands += 1
    return islands
```

### DFS on directed graph — cycle detection (Course Schedule)

Three-color DFS: `0` = unvisited, `1` = in current path (gray), `2` = done (black). A back edge (reaching a gray node) signals a cycle.

```python
from collections import defaultdict

def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    graph: dict[int, list[int]] = defaultdict(list)
    for course, prereq in prerequisites:
        graph[prereq].append(course)

    state = [0] * num_courses    # 0=unvisited, 1=visiting, 2=done

    def dfs(node: int) -> bool:
        if state[node] == 1:
            return False          # back edge: cycle
        if state[node] == 2:
            return True           # already fully explored
        state[node] = 1
        for neighbor in graph[node]:
            if not dfs(neighbor):
                return False
        state[node] = 2
        return True

    return all(dfs(c) for c in range(num_courses))
```

### BFS — Word Ladder (shortest transformation path)

BFS guarantees shortest path. Each word is a node; edges connect words differing by exactly one character.

```python
from collections import deque

def word_ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:
    word_set = set(word_list)
    if end_word not in word_set:
        return 0
    queue: deque[tuple[str, int]] = deque([(begin_word, 1)])
    visited: set[str] = {begin_word}

    while queue:
        word, length = queue.popleft()
        for i in range(len(word)):
            for ch in "abcdefghijklmnopqrstuvwxyz":
                new_word = word[:i] + ch + word[i + 1:]
                if new_word == end_word:
                    return length + 1
                if new_word in word_set and new_word not in visited:
                    visited.add(new_word)
                    queue.append((new_word, length + 1))
    return 0
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Num Islands | O(m·n) | O(m·n) DFS call stack |
| Can Finish | O(V + E) | O(V + E) |
| Word Ladder | O(n · m · 26) | O(n · m) |

## Common variations

- **Number of Connected Components** — same DFS pattern on an adjacency list
- **Clone Graph** — BFS/DFS with a `dict` mapping original → clone node
- **Pacific Atlantic Water Flow** — reverse DFS from both ocean borders simultaneously
- **Topological Sort** — Kahn's BFS with in-degree tracking; same idea as `can_finish` but return the order

## vs other languages

Python's `set` for `visited` is standard. Mutating the grid avoids a separate set but destroys input — mention this in an interview. Java/C++ would use `boolean[][]`. The string slice `word[:i] + ch + word[i+1:]` is O(m) per operation and idiomatic in Python; Java uses `StringBuilder`.

## Watch out

- **Grid bounds check must come before `grid[r][c]` access** — put `0 <= r < rows and 0 <= c < cols` first or Python raises `IndexError`.
- **Undirected vs directed cycle detection differ.** For undirected graphs, track parent to avoid backtracking through the same edge. For directed, use three-color DFS.
- **`can_finish` must start DFS from every node** — the graph may be disconnected. `all(dfs(c) for c in range(num_courses))` handles this.
- **Word Ladder: check `end_word in word_set` first** — if the target isn't reachable at all, return 0 immediately rather than exploring the entire word space.

## FAANG follow-up questions

> "Can you solve `num_islands` without recursion?" — Yes: iterative DFS with an explicit `stack = [(r, c)]`, or BFS with a queue. Same O(m·n) complexity.

> "How do you handle very large grids where DFS hits Python's recursion limit?" — Convert to iterative DFS. The depth is bounded by island size, which can be m·n worst case.

> "How would you speed up Word Ladder?" — Bidirectional BFS: search from `begin_word` and `end_word` simultaneously, meeting in the middle. Reduces the search frontier from O(b^d) to O(b^(d/2)).

## The task

```python
def num_islands(grid: list[list[str]]) -> int:
    """Count the number of islands. '1' is land, '0' is water.
    Islands are groups of adjacent land cells (horizontal/vertical).
    You may modify the grid."""

def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    """Return True if all courses can be finished.
    prerequisites[i] = [a, b] means b must be taken before a."""

def word_ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:
    """Return the number of words in the shortest transformation sequence from
    begin_word to end_word where each step changes exactly one letter and
    every intermediate word must be in word_list. Return 0 if impossible."""
```

**Examples:**
- `num_islands([["1","1","0"],["1","1","0"],["0","0","1"]])` → `2`
- `can_finish(2, [[1,0]])` → `True`
- `can_finish(2, [[1,0],[0,1]])` → `False`
- `word_ladder_length("hit","cog",["hot","dot","dog","lot","log","cog"])` → `5`
- `word_ladder_length("hit","cog",["hot","dot","dog","lot","log"])` → `0`
