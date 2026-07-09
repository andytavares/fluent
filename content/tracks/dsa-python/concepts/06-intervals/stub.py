# Run: python3 stub.py


def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    """Merges all overlapping (or touching) intervals; returns the merged
    list sorted by start."""
    # TODO: sort by start (key=lambda iv: iv[0]), then sweep — extend the last
    # merged block when start <= last[1] (max the end), else append a new block
    return []


def insert_interval(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    """Inserts new_interval into a sorted, non-overlapping interval list,
    merging where needed. One O(n) pass — no re-sorting."""
    # TODO: three phases — copy intervals ending before new_interval starts;
    # absorb every interval starting at or before its end (min/max);
    # append the absorbed interval, then copy the rest
    return []


def min_arrows(points: list[list[int]]) -> int:
    """Returns the minimum number of arrows needed to burst all balloons.
    An arrow at x bursts every balloon with xstart <= x <= xend."""
    # TODO: sort by end; shoot at the first balloon's end; a balloon with
    # start > arrow_x needs a new arrow at its own end
    return 0


def main() -> None:
    print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))
    # [[1, 6], [8, 10], [15, 18]]
    print(insert_interval([[1, 3], [6, 9]], [2, 5]))
    # [[1, 5], [6, 9]]
    print(min_arrows([[10, 16], [2, 8], [1, 6], [7, 12]]))  # 2


if __name__ == "__main__":
    main()
