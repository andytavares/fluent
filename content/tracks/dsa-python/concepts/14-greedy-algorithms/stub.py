from collections import Counter


def can_jump(nums: list[int]) -> bool:
    """Return True if you can reach the last index from index 0.
    nums[i] is the maximum jump length from position i."""
    # TODO: track farthest reachable index; return False if current index exceeds it
    return False


def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    """Merge all overlapping intervals. Return sorted merged list."""
    # TODO: sort by start; for each interval, extend last merged if overlap else append
    return []


def task_scheduler(tasks: list[str], n: int) -> int:
    """Return minimum CPU intervals to finish all tasks with cooldown n."""
    # TODO: find max frequency and count of tasks with that frequency;
    #       return max(len(tasks), (max_count - 1) * (n + 1) + num_max)
    return 0


if __name__ == "__main__":
    print(can_jump([2, 3, 1, 1, 4]))   # True
    print(can_jump([3, 2, 1, 0, 4]))   # False
    print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))  # [[1,6],[8,10],[15,18]]
    print(task_scheduler(["A","A","A","B","B","B"], 2))  # 8
    print(task_scheduler(["A","A","A","B","B","B"], 0))  # 6
