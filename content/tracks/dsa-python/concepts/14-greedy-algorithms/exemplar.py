from collections import Counter


def can_jump(nums: list[int]) -> bool:
    """Return True if you can reach the last index from index 0."""
    farthest = 0
    for i, jump in enumerate(nums):
        if i > farthest:
            return False
        farthest = max(farthest, i + jump)
    return True


def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    """Merge all overlapping intervals. Return sorted merged list."""
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0][:]]  # copy first interval
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged


def task_scheduler(tasks: list[str], n: int) -> int:
    """Return minimum CPU intervals to finish all tasks with cooldown n."""
    counts = Counter(tasks)
    max_count = max(counts.values())
    num_max = sum(1 for c in counts.values() if c == max_count)
    return max(len(tasks), (max_count - 1) * (n + 1) + num_max)
