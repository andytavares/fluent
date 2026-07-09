// Run: node exemplar.js

/**
 * Returns true if no row, column, or 3x3 box contains a repeated digit.
 * One pass with a Set per row, column, and box; "." cells impose nothing.
 * O(81) time / O(81) entries — constant for the fixed board.
 * @param {string[][]} board  9x9, cells "1".."9" or "."
 * @returns {boolean}
 */
function isValidSudoku(board) {
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxes = Array.from({ length: 9 }, () => new Set());

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v === ".") continue;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (rows[r].has(v) || cols[c].has(v) || boxes[b].has(v)) return false;
      rows[r].add(v);
      cols[c].add(v);
      boxes[b].add(v);
    }
  }
  return true;
}

/**
 * Returns all elements of an m x n matrix in clockwise spiral order.
 * Four shrinking boundaries; the mid-loop re-checks stop a degenerate
 * single-row/column inner layer from being emitted twice.
 * O(mn) time, O(1) space beyond the output.
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function spiralOrder(matrix) {
  const result = [];
  if (matrix.length === 0) return result;

  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) result.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) result.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) result.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) result.push(matrix[r][left]);
      left++;
    }
  }
  return result;
}

/**
 * Rotates an n x n matrix 90 degrees clockwise, in place.
 * Transpose (swap across the diagonal, upper triangle only) then reverse
 * each row: (r,c) -> (c,r) -> (c,n-1-r), exactly the clockwise rotation.
 * O(n²) time, O(1) space.
 * @param {number[][]} matrix
 * @returns {void}
 */
function rotateImage(matrix) {
  const n = matrix.length;
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {
      const tmp = matrix[r][c];
      matrix[r][c] = matrix[c][r];
      matrix[c][r] = tmp;
    }
  }
  for (const row of matrix) row.reverse();
}

module.exports = { isValidSudoku, spiralOrder, rotateImage };

function main() {
  const board = [
    ["5", "3", ".", ".", "7", ".", ".", ".", "."],
    ["6", ".", ".", "1", "9", "5", ".", ".", "."],
    [".", "9", "8", ".", ".", ".", ".", "6", "."],
    ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
    ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
    ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
    [".", "6", ".", ".", ".", ".", "2", "8", "."],
    [".", ".", ".", "4", "1", "9", ".", ".", "5"],
    [".", ".", ".", ".", "8", ".", ".", "7", "9"],
  ];
  console.log(isValidSudoku(board)); // true

  console.log(JSON.stringify(spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]])));
  // [1,2,3,6,9,8,7,4,5]

  const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  rotateImage(m);
  console.log(JSON.stringify(m)); // [[7,4,1],[8,5,2],[9,6,3]]
}

main();
