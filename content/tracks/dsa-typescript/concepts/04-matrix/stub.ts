// Run: tsx stub.ts

/**
 * Returns true if no row, column, or 3x3 box contains a repeated digit.
 * board is 9x9; cells are "1".."9" or "." (ignored).
 */
function isValidSudoku(board: string[][]): boolean {
  // TODO: nine Sets each for rows/cols/boxes — Array.from({length: 9}, () => new Set()),
  // NOT new Array(9).fill(new Set()); box index is floor(r/3)*3 + floor(c/3)
  return false;
}

/**
 * Returns all elements of an m x n matrix in clockwise spiral order.
 */
function spiralOrder(matrix: number[][]): number[] {
  // TODO: four boundaries (top/bottom/left/right) shrinking inward;
  // re-check top <= bottom and left <= right before the return legs
  return [];
}

/**
 * Rotates an n x n matrix 90 degrees clockwise, in place.
 * @returns void — mutate matrix, the return value is ignored
 */
function rotateImage(matrix: number[][]): void {
  // TODO: transpose in place (swap only where c > r), then reverse each row
}

export { isValidSudoku, spiralOrder, rotateImage };

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
