from collections import deque


def sliding_window_maximum(nums: list[int], k: int) -> list[int]:
    """Return the maximum value in each sliding window of size k."""
    # TODO: monotonic decreasing deque of indices; evict out-of-window from left,
    #       evict smaller values from right; append result when i >= k-1
    return []


class RecentCounter:
    """Counts recent requests within a 3000ms sliding window."""

    def __init__(self) -> None:
        # TODO: use a deque to store timestamps
        pass

    def ping(self, t: int) -> int:
        """Add request at time t (ms). Return count in [t-3000, t]."""
        # TODO: append t; popleft while front < t - 3000
        return 0


def rotting_oranges(grid: list[list[int]]) -> int:
    """Return minimum minutes until no fresh orange remains, or -1 if impossible."""
    # TODO: multi-source BFS — seed queue with all rotten oranges;
    #       process level by level (each level = 1 minute);
    #       return -1 if fresh > 0 after BFS
    return 0


if __name__ == "__main__":
    print(sliding_window_maximum([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3,3,5,5,6,7]
    print(sliding_window_maximum([1], 1))                            # [1]
    rc = RecentCounter()
    print(rc.ping(1))     # 1
    print(rc.ping(100))   # 2
    print(rc.ping(3001))  # 3
    print(rc.ping(3002))  # 3
    print(rotting_oranges([[2, 1, 1], [1, 1, 0], [0, 1, 1]]))  # 4
    print(rotting_oranges([[0, 2]]))                              # 0
