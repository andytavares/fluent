# Greedy Algorithms

## What you'll learn

How to recognize when a locally optimal choice leads to a globally optimal solution — and when it doesn't. The three problems here cover interval sorting, reachability, and frequency-based scheduling — three shapes that recur throughout FAANG interviews.

## Key concepts

### Pattern 1 — Greedy reachability scan (Jump Game)

Track the farthest index reachable from any position seen so far. If the current index ever exceeds `maxReach`, no jump can bridge the gap.

```java
public static boolean canJump(int[] nums) {
    int maxReach = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > maxReach) return false; // island of unreachability
        maxReach = Math.max(maxReach, i + nums[i]);
    }
    return true;
}
```

### Pattern 2 — Sort then sweep (Merge Intervals)

Sort by start time. Walk the sorted list; if the next interval overlaps the current merged end, extend. Otherwise, start a new merged interval.

```java
public static int[][] mergeIntervals(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    var result = new ArrayList<int[]>();
    result.add(intervals[0]);
    for (int i = 1; i < intervals.length; i++) {
        int[] last = result.get(result.size() - 1);
        if (intervals[i][0] <= last[1]) {
            last[1] = Math.max(last[1], intervals[i][1]);
        } else {
            result.add(intervals[i]);
        }
    }
    return result.toArray(new int[0][]);
}
```

### Pattern 3 — Frequency formula (Task Scheduler)

Between two instances of the same task you must wait at least `n` slots. The bottleneck is the most frequent task. After placing the most frequent task, fill idle slots with others in decreasing frequency order.

```java
public static int taskScheduler(char[] tasks, int n) {
    int[] freq = new int[26];
    for (char t : tasks) freq[t - 'A']++;
    Arrays.sort(freq); // freq[25] = highest frequency

    int maxFreq = freq[25];
    int idleSlots = (maxFreq - 1) * n; // slots between occurrences of most frequent task
    for (int i = 24; i >= 0 && idleSlots > 0; i--) {
        idleSlots -= Math.min(freq[i], maxFreq - 1); // fill idle with other tasks
    }
    return tasks.length + Math.max(0, idleSlots);
}
```

Key insight: `tasks.length + max(0, idleSlots)`. If there are enough tasks to fill all idle slots, idle = 0 and the answer is just `tasks.length`.

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `canJump` | O(n) | O(1) | Single pass, one variable |
| `mergeIntervals` | O(n log n) | O(n) | Sort dominates; result list is O(n) |
| `taskScheduler` | O(n) | O(1) | Freq array is fixed size 26; sort is O(26 log 26) = O(1) |

## Common variations this pattern solves

1. **Jump Game II** — minimum jumps; greedy: expand current range until you reach end
2. **Non-overlapping Intervals** — remove minimum intervals to make non-overlapping; sort by end
3. **Meeting Rooms II** — minimum rooms; sort starts and ends, two-pointer sweep
4. **Gas Station** — find start position; greedy: if total gas >= total cost, solution exists

## vs dynamic programming

Greedy is O(n); DP for canJump is O(n²). Greedy is correct here because extending maxReach is never harmful — you can always take fewer steps. Coin Change cannot be solved greedily (large denominations may not lead to optimal) and requires DP.

## Watch out

- **`mergeIntervals` comparator overflow**: `(a, b) -> a[0] - b[0]` overflows when `a[0]` is very negative and `b[0]` is very positive. Always use `Integer.compare(a[0], b[0])`.
- **`mergeIntervals` empty input**: `intervals[0]` without a null/length check throws `ArrayIndexOutOfBoundsException`. Add a guard at the top.
- **`taskScheduler` with n=0**: no cooldown means every task runs immediately. The formula gives 0 idle slots; answer is `tasks.length`. Verify this works with your implementation.
- **`taskScheduler` counts tasks, not types**: `tasks.length` is total task count. The frequency array counts per letter (26 slots). Don't confuse them.

## FAANG follow-up questions

> "Can Jump Game II (minimum jumps) be solved greedily?" — Yes. Track `currentEnd` (farthest index reachable in the current jump) and `farthest` (farthest in next jump). When `i == currentEnd`, increment jumps and set `currentEnd = farthest`.
>
> "What's the difference between merging intervals and non-overlapping intervals?" — Merge: keep all, extend overlapping ones. Non-overlapping: remove minimum count to make disjoint — sort by end time and greedily keep intervals that end earliest.
>
> "Is taskScheduler solvable by simulation with a priority queue?" — Yes: max-heap by frequency, pop top k tasks per cycle (k = n+1), decrement counts, re-push non-zero. O(n log 26) = O(n) but more code. The formula is cleaner.
>
> "When does greedy fail on interval problems?" — When the locally optimal choice (e.g., earliest start) doesn't minimize global idle time. Weighted interval scheduling (maximize total profit) requires DP.

## The task

Implement three methods in `Solution`:

```java
// Returns true if you can reach the last index from index 0.
// nums[i] = max jump length from index i.
// [2,3,1,1,4] -> true, [3,2,1,0,4] -> false
public static boolean canJump(int[] nums)

// Merges all overlapping intervals and returns the merged list sorted by start.
// [[1,3],[2,6],[8,10],[15,18]] -> [[1,6],[8,10],[15,18]]
public static int[][] mergeIntervals(int[][] intervals)

// Returns the minimum number of time units to finish all tasks with cooldown n.
// tasks=['A','A','A','B','B','B'], n=2 -> 8 (A->B->idle->A->B->idle->A->B)
public static int taskScheduler(char[] tasks, int n)
```
