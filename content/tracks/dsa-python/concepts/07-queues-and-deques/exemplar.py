from collections import deque


def sliding_window_maximum(nums: list[int], k: int) -> list[int]:
    """Return the maximum value in each sliding window of size k."""
    dq: deque[int] = deque()   # indices; nums[dq[0]] is the window max
    result: list[int] = []
    for i, x in enumerate(nums):
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        while dq and nums[dq[-1]] < x:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result


class RecentCounter:
    """Counts recent requests within a 3000ms sliding window."""

    def __init__(self) -> None:
        self.q: deque[int] = deque()

    def ping(self, t: int) -> int:
        """Add request at time t (ms). Return count in [t-3000, t]."""
        self.q.append(t)
        while self.q[0] < t - 3000:
            self.q.popleft()
        return len(self.q)


def rotting_oranges(grid: list[list[int]]) -> int:
    """Return minimum minutes until no fresh orange remains, or -1 if impossible."""
    rows, cols = len(grid), len(grid[0])
    queue: deque[tuple[int, int]] = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    if fresh == 0:
        return 0

    minutes = 0
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    while queue and fresh > 0:
        minutes += 1
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))

    return minutes if fresh == 0 else -1
