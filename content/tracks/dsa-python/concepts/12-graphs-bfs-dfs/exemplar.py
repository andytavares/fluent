# Run: python3 exemplar.py

from collections import deque

DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]


def num_islands(grid):
    """Scan every cell; each fresh "1" starts a new island, and an iterative
    flood fill sinks the whole island to "0" so it is never recounted. Cells
    are marked when pushed (not when popped) so nothing enters the stack
    twice. The explicit stack keeps snake-shaped islands from overflowing
    Python's recursion limit.
    O(rows * cols) time, O(rows * cols) worst-case stack.
    """
    rows = len(grid)
    cols = len(grid[0])
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != "1":
                continue
            count += 1
            stack = [(r, c)]
            grid[r][c] = "0"
            while stack:
                cr, cc = stack.pop()
                for dr, dc in DIRS:
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                        grid[nr][nc] = "0"
                        stack.append((nr, nc))
    return count


def clone_graph(graph):
    """Deep copy of an adjacency dict: one fresh container per level -- a new
    outer dict and a new list per node. A shallow copy of the outer dict
    would still share the neighbor lists, so mutating the clone would
    corrupt the original.
    O(V + E) time and space.
    """
    return {node: list(neighbors) for node, neighbors in graph.items()}


def can_finish(num_courses, prerequisites):
    """Kahn's topological sort: a course enters the queue exactly when its
    last prerequisite is taken. Courses on a cycle never reach indegree 0,
    so the graph is acyclic iff every course gets processed.
    O(V + E) time and space.
    """
    adj = [[] for _ in range(num_courses)]
    indegree = [0] * num_courses
    for course, prereq in prerequisites:
        adj[prereq].append(course)  # edge prereq -> course
        indegree[course] += 1

    queue = deque(i for i in range(num_courses) if indegree[i] == 0)
    processed = 0
    while queue:
        course = queue.popleft()
        processed += 1
        for nxt in adj[course]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return processed == num_courses


def main():
    print(num_islands([
        ["1", "1", "0", "0", "0"],
        ["1", "1", "0", "0", "0"],
        ["0", "0", "1", "0", "0"],
        ["0", "0", "0", "1", "1"],
    ]))  # 3

    graph = {"1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"]}
    clone = clone_graph(graph)
    print(clone, clone is not graph and clone["1"] is not graph["1"])

    print(can_finish(2, [(1, 0)]))  # True
    print(can_finish(2, [(1, 0), (0, 1)]))  # False


if __name__ == "__main__":
    main()
