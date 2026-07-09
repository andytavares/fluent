import assert from "assert";
import { isValidSudoku, spiralOrder, rotateImage } from "./stub";

let passed = 0, failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name} — ${(e as Error).message}`);
    failed++;
  }
}

// Helper: build a 9x9 board from nine 9-character strings ("." = empty)
function board(rows: string[]): string[][] {
  return rows.map((row) => row.split(""));
}

const VALID_PUZZLE = [
  "53..7....",
  "6..195...",
  ".98....6.",
  "8...6...3",
  "4..8.3..1",
  "7...2...6",
  ".6....28.",
  "...419..5",
  "....8..79",
];

const SOLVED_BOARD = [
  "534678912",
  "672195348",
  "198342567",
  "859761423",
  "426853791",
  "713924856",
  "961537284",
  "287419635",
  "345286179",
];

// ── isValidSudoku ──
test("isValidSudoku: legal partially filled board", () => {
  assert.strictEqual(isValidSudoku(board(VALID_PUZZLE)), true);
});
test("isValidSudoku: row conflict", () => {
  const rows = [...VALID_PUZZLE];
  rows[0] = "53..7...5"; // second 5 in row 0; column 8 and box 2 stay clean
  assert.strictEqual(isValidSudoku(board(rows)), false);
});
test("isValidSudoku: column conflict", () => {
  const rows = [...VALID_PUZZLE];
  rows[8] = "5...8..79"; // second 5 in column 0; row 8 and box 6 stay clean
  assert.strictEqual(isValidSudoku(board(rows)), false);
});
test("isValidSudoku: box-only conflict (rows and columns clean)", () => {
  const rows = [...VALID_PUZZLE];
  rows[0] = "536.7...."; // 6 at (0,2) duplicates 6 at (1,0) in the top-left box
  assert.strictEqual(isValidSudoku(board(rows)), false);
});
test("isValidSudoku: empty board is valid", () => {
  assert.strictEqual(isValidSudoku(board(new Array(9).fill("........."))), true);
});
test("isValidSudoku: same digit in different rows, columns, and boxes", () => {
  const rows = [
    "1........",
    ".........",
    ".........",
    ".........",
    "....1....",
    ".........",
    ".........",
    ".........",
    "........1",
  ];
  assert.strictEqual(isValidSudoku(board(rows)), true);
});
test("isValidSudoku: conflict at the very last cell", () => {
  const rows = [...VALID_PUZZLE];
  rows[8] = "....8..78"; // (8,8) duplicates the 8 at (8,4) in row 8
  assert.strictEqual(isValidSudoku(board(rows)), false);
});
test("isValidSudoku: fully solved board is valid", () => {
  assert.strictEqual(isValidSudoku(board(SOLVED_BOARD)), true);
});
test("isValidSudoku: solved board with one corrupted cell", () => {
  const rows = [...SOLVED_BOARD];
  rows[0] = "334678912"; // (0,0) 5 -> 3 duplicates the 3 at (0,1)
  assert.strictEqual(isValidSudoku(board(rows)), false);
});

// ── spiralOrder ──
test("spiralOrder: 3x3 square", () => {
  assert.deepStrictEqual(
    spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
    [1, 2, 3, 6, 9, 8, 7, 4, 5],
  );
});
test("spiralOrder: 3x4 wide (inner layer is a single row)", () => {
  assert.deepStrictEqual(
    spiralOrder([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]),
    [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7],
  );
});
test("spiralOrder: 4x3 tall (inner layer is a single column)", () => {
  assert.deepStrictEqual(
    spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]),
    [1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8],
  );
});
test("spiralOrder: single row", () => {
  assert.deepStrictEqual(spiralOrder([[1, 2, 3, 4, 5]]), [1, 2, 3, 4, 5]);
});
test("spiralOrder: single column", () => {
  assert.deepStrictEqual(spiralOrder([[1], [2], [3], [4]]), [1, 2, 3, 4]);
});
test("spiralOrder: single cell", () => {
  assert.deepStrictEqual(spiralOrder([[7]]), [7]);
});
test("spiralOrder: 2x2", () => {
  assert.deepStrictEqual(spiralOrder([[1, 2], [3, 4]]), [1, 2, 4, 3]);
});
test("spiralOrder: 2x3 (no inner layer)", () => {
  assert.deepStrictEqual(spiralOrder([[1, 2, 3], [4, 5, 6]]), [1, 2, 3, 6, 5, 4]);
});
test("spiralOrder: 5x5 full spiral", () => {
  const m = Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 5 }, (_, c) => r * 5 + c + 1),
  );
  assert.deepStrictEqual(
    spiralOrder(m),
    [1, 2, 3, 4, 5, 10, 15, 20, 25, 24, 23, 22, 21, 16, 11, 6, 7, 8, 9, 14, 19, 18, 17, 12, 13],
  );
});
test("spiralOrder: 40x30 emits every cell exactly once", () => {
  const m = Array.from({ length: 40 }, (_, r) =>
    Array.from({ length: 30 }, (_, c) => r * 30 + c),
  );
  const result = spiralOrder(m);
  assert.strictEqual(result.length, 1200);
  assert.strictEqual(new Set(result).size, 1200);
  assert.strictEqual(result[0], 0);
  assert.strictEqual(result[29], 29); // end of the top row
  assert.strictEqual(result[result.length - 1], m[15][14]); // innermost cell
});

// ── rotateImage — always assert on the mutated matrix, never on the return value ──
test("rotateImage: 3x3 mutates in place", () => {
  const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  rotateImage(m);
  assert.deepStrictEqual(m, [[7, 4, 1], [8, 5, 2], [9, 6, 3]]);
});
test("rotateImage: 4x4", () => {
  const m = [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]];
  rotateImage(m);
  assert.deepStrictEqual(m, [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]);
});
test("rotateImage: 1x1 unchanged", () => {
  const m = [[42]];
  rotateImage(m);
  assert.deepStrictEqual(m, [[42]]);
});
test("rotateImage: 2x2", () => {
  const m = [[1, 2], [3, 4]];
  rotateImage(m);
  assert.deepStrictEqual(m, [[3, 1], [4, 2]]);
});
test("rotateImage: duplicate values move by position", () => {
  const m = [[1, 1, 2], [1, 1, 2], [3, 3, 3]];
  rotateImage(m);
  assert.deepStrictEqual(m, [[3, 1, 1], [3, 1, 1], [3, 2, 2]]);
});
test("rotateImage: works even if the return value is discarded", () => {
  const m = [[1, 2], [3, 4]];
  void rotateImage(m);
  assert.deepStrictEqual(m, [[3, 1], [4, 2]]);
});
test("rotateImage: 25x25 matches the rotation formula everywhere", () => {
  const n = 25;
  const m = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => r * 1000 + c),
  );
  rotateImage(m);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      // rotated[c][n-1-r] must hold the original (r, c) value
      assert.strictEqual(m[c][n - 1 - r], r * 1000 + c);
    }
  }
});
test("rotateImage: four rotations restore a 10x10 matrix", () => {
  const n = 10;
  const original = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => r * n + c),
  );
  const m = original.map((row) => [...row]);
  rotateImage(m);
  rotateImage(m);
  rotateImage(m);
  rotateImage(m);
  assert.deepStrictEqual(m, original);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
