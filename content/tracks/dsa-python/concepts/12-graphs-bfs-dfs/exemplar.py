from collections import defaultdict, deque


def num_islands(grid: list[list[str]]) -> int:
    """Count the number of islands ('1' groups) in the grid."""
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    islands = 0

    def dfs(r: int, c: int) -> None:
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"          # mark visited
        dfs(r + 1, c); dfs(r - 1, c)
        dfs(r, c + 1); dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                dfs(r, c)
                islands += 1
    return islands


def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    """Return True if all courses can be finished (no cycle in prerequisite graph)."""
    graph: dict[int, list[int]] = defaultdict(list)
    for course, prereq in prerequisites:
        graph[prereq].append(course)

    state = [0] * num_courses    # 0=unvisited, 1=visiting, 2=done

    def dfs(node: int) -> bool:
        if state[node] == 1:
            return False          # back edge: cycle detected
        if state[node] == 2:
            return True           # already fully processed
        state[node] = 1
        for neighbor in graph[node]:
            if not dfs(neighbor):
                return False
        state[node] = 2
        return True

    return all(dfs(c) for c in range(num_courses))


def word_ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:
    """Return the shortest transformation sequence length; 0 if impossible."""
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
