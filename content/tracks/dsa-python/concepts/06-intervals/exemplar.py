# Run: python3 exemplar.py


def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    """Merges all overlapping (or touching) intervals; returns the merged
    list sorted by start. After sorting by start, every interval that can
    merge with the current block arrives before any interval that can't, so
    one sweep against the last merged block suffices.
    O(n log n) time, O(n) output space."""
    if not intervals:
        return []
    sorted_intervals = sorted(intervals, key=lambda iv: iv[0])
    merged = [list(sorted_intervals[0])]
    for start, end in sorted_intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = max(last[1], end)  # extend — max handles containment
        else:
            merged.append([start, end])  # gap — new block
    return merged


def insert_interval(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    """Inserts new_interval into a sorted, non-overlapping list in one pass.
    Three phases: strictly-before intervals, overlapping intervals (absorbed
    into new_interval), strictly-after intervals.
    O(n) time, O(n) output space."""
    result: list[list[int]] = []
    start, end = new_interval
    n = len(intervals)
    i = 0

    while i < n and intervals[i][1] < start:
        result.append(list(intervals[i]))
        i += 1

    while i < n and intervals[i][0] <= end:
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    result.append([start, end])

    while i < n:
        result.append(list(intervals[i]))
        i += 1

    return result


def min_arrows(points: list[list[int]]) -> int:
    """Returns the minimum number of arrows needed to burst all balloons.
    Sort by end and shoot each arrow at a balloon's end — the latest
    position that still bursts it, so it catches the most balloons after it.
    O(n log n) time, O(1) extra space."""
    if not points:
        return 0
    sorted_points = sorted(points, key=lambda p: p[1])
    arrows = 1
    arrow_x = sorted_points[0][1]
    for start, end in sorted_points:
        if start > arrow_x:  # strictly after — touching balloons share the arrow
            arrows += 1
            arrow_x = end
    return arrows


def main() -> None:
    print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))
    # [[1, 6], [8, 10], [15, 18]]
    print(insert_interval([[1, 3], [6, 9]], [2, 5]))
    # [[1, 5], [6, 9]]
    print(min_arrows([[10, 16], [2, 8], [1, 6], [7, 12]]))  # 2


if __name__ == "__main__":
    main()
