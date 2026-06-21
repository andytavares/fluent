// Run: tsx exemplar.ts

export function slidingWindowMaximum(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // indices; front = max's index

  for (let i = 0; i < nums.length; i++) {
    // Remove indices no longer in the window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }
    // Maintain decreasing order — remove smaller elements from back
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }
    deque.push(i);

    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }
  return result;
}

export class RecentCounter {
  private queue: number[] = [];

  ping(t: number): number {
    this.queue.push(t);
    // Remove timestamps outside the [t-3000, t] window
    while (this.queue[0] < t - 3000) {
      this.queue.shift();
    }
    return this.queue.length;
  }
}

export function rottingOranges(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue: [number, number][] = [];
  let fresh = 0;

  // Seed BFS with all initially-rotten oranges; count fresh oranges
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }

  const directions: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutes = 0;

  while (queue.length > 0 && fresh > 0) {
    minutes++;
    const size = queue.length; // process exactly one "minute" per outer iteration
    for (let i = 0; i < size; i++) {
      const [r, c] = queue.shift()!;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2; // mark as rotten (visited)
          fresh--;
          queue.push([nr, nc]);
        }
      }
    }
  }

  return fresh === 0 ? minutes : -1;
}
