import java.util.ArrayList;
import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static char[][] board(String[] rows) {
        char[][] b = new char[9][9];
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) b[r][c] = rows[r].charAt(c);
        }
        return b;
    }

    static final String[] VALID_PUZZLE = {
        "53..7....",
        "6..195...",
        ".98....6.",
        "8...6...3",
        "4..8.3..1",
        "7...2...6",
        ".6....28.",
        "...419..5",
        "....8..79",
    };

    static final String[] SOLVED_BOARD = {
        "534678912",
        "672195348",
        "198342567",
        "859761423",
        "426853791",
        "713924856",
        "961537284",
        "287419635",
        "345286179",
    };

    public static void main(String[] args) {
        // isValidSudoku
        check("isValidSudoku: legal partially filled board", Solution.isValidSudoku(board(VALID_PUZZLE)));

        String[] rowConflict = VALID_PUZZLE.clone();
        rowConflict[0] = "53..7...5";
        check("isValidSudoku: row conflict", !Solution.isValidSudoku(board(rowConflict)));

        String[] colConflict = VALID_PUZZLE.clone();
        colConflict[8] = "5...8..79";
        check("isValidSudoku: column conflict", !Solution.isValidSudoku(board(colConflict)));

        String[] boxConflict = VALID_PUZZLE.clone();
        boxConflict[0] = "536.7....";
        check("isValidSudoku: box-only conflict (rows and columns clean)", !Solution.isValidSudoku(board(boxConflict)));

        String[] empty = new String[9];
        java.util.Arrays.fill(empty, ".........");
        check("isValidSudoku: empty board is valid", Solution.isValidSudoku(board(empty)));

        String[] scattered = {
            "1........",
            ".........",
            ".........",
            ".........",
            "....1....",
            ".........",
            ".........",
            ".........",
            "........1",
        };
        check("isValidSudoku: same digit in different rows, columns, and boxes", Solution.isValidSudoku(board(scattered)));

        String[] lastCellConflict = VALID_PUZZLE.clone();
        lastCellConflict[8] = "....8..78";
        check("isValidSudoku: conflict at the very last cell", !Solution.isValidSudoku(board(lastCellConflict)));

        check("isValidSudoku: fully solved board is valid", Solution.isValidSudoku(board(SOLVED_BOARD)));

        String[] corrupted = SOLVED_BOARD.clone();
        corrupted[0] = "334678912";
        check("isValidSudoku: solved board with one corrupted cell", !Solution.isValidSudoku(board(corrupted)));

        // spiralOrder
        check("spiralOrder: 3x3 square",
              Solution.spiralOrder(new int[][]{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}})
                  .equals(List.of(1, 2, 3, 6, 9, 8, 7, 4, 5)));
        check("spiralOrder: 3x4 wide (inner layer is a single row)",
              Solution.spiralOrder(new int[][]{{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}})
                  .equals(List.of(1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7)));
        check("spiralOrder: 4x3 tall (inner layer is a single column)",
              Solution.spiralOrder(new int[][]{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12}})
                  .equals(List.of(1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8)));
        check("spiralOrder: single row",
              Solution.spiralOrder(new int[][]{{1, 2, 3, 4, 5}}).equals(List.of(1, 2, 3, 4, 5)));
        check("spiralOrder: single column",
              Solution.spiralOrder(new int[][]{{1}, {2}, {3}, {4}}).equals(List.of(1, 2, 3, 4)));
        check("spiralOrder: single cell",
              Solution.spiralOrder(new int[][]{{7}}).equals(List.of(7)));
        check("spiralOrder: 2x2",
              Solution.spiralOrder(new int[][]{{1, 2}, {3, 4}}).equals(List.of(1, 2, 4, 3)));
        check("spiralOrder: 2x3 (no inner layer)",
              Solution.spiralOrder(new int[][]{{1, 2, 3}, {4, 5, 6}}).equals(List.of(1, 2, 3, 6, 5, 4)));

        int[][] m5 = new int[5][5];
        for (int r = 0; r < 5; r++) for (int c = 0; c < 5; c++) m5[r][c] = r * 5 + c + 1;
        check("spiralOrder: 5x5 full spiral",
              Solution.spiralOrder(m5).equals(List.of(1, 2, 3, 4, 5, 10, 15, 20, 25, 24, 23, 22, 21, 16, 11, 6, 7, 8, 9, 14, 19, 18, 17, 12, 13)));

        int[][] big = new int[40][30];
        for (int r = 0; r < 40; r++) for (int c = 0; c < 30; c++) big[r][c] = r * 30 + c;
        List<Integer> bigResult = Solution.spiralOrder(big);
        check("spiralOrder: 40x30 emits every cell exactly once",
              bigResult.size() == 1200
                  && new java.util.HashSet<>(bigResult).size() == 1200
                  && bigResult.get(0) == 0
                  && bigResult.get(29) == 29
                  && bigResult.get(bigResult.size() - 1) == big[15][14]);

        // rotateImage
        int[][] r1 = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        Solution.rotateImage(r1);
        check("rotateImage: 3x3 mutates in place",
              java.util.Arrays.deepEquals(r1, new int[][]{{7, 4, 1}, {8, 5, 2}, {9, 6, 3}}));

        int[][] r2 = {{5, 1, 9, 11}, {2, 4, 8, 10}, {13, 3, 6, 7}, {15, 14, 12, 16}};
        Solution.rotateImage(r2);
        check("rotateImage: 4x4",
              java.util.Arrays.deepEquals(r2, new int[][]{{15, 13, 2, 5}, {14, 3, 4, 1}, {12, 6, 8, 9}, {16, 7, 10, 11}}));

        int[][] r3 = {{42}};
        Solution.rotateImage(r3);
        check("rotateImage: 1x1 unchanged", java.util.Arrays.deepEquals(r3, new int[][]{{42}}));

        int[][] r4 = {{1, 2}, {3, 4}};
        Solution.rotateImage(r4);
        check("rotateImage: 2x2", java.util.Arrays.deepEquals(r4, new int[][]{{3, 1}, {4, 2}}));

        int[][] r5 = {{1, 1, 2}, {1, 1, 2}, {3, 3, 3}};
        Solution.rotateImage(r5);
        check("rotateImage: duplicate values move by position",
              java.util.Arrays.deepEquals(r5, new int[][]{{3, 1, 1}, {3, 1, 1}, {3, 2, 2}}));

        int n = 25;
        int[][] r6 = new int[n][n];
        for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) r6[r][c] = r * 1000 + c;
        Solution.rotateImage(r6);
        boolean formulaOk = true;
        for (int r = 0; r < n; r++) {
            for (int c = 0; c < n; c++) {
                if (r6[c][n - 1 - r] != r * 1000 + c) formulaOk = false;
            }
        }
        check("rotateImage: 25x25 matches the rotation formula everywhere", formulaOk);

        int n2 = 10;
        int[][] original = new int[n2][n2];
        for (int r = 0; r < n2; r++) for (int c = 0; c < n2; c++) original[r][c] = r * n2 + c;
        int[][] r7 = new int[n2][n2];
        for (int r = 0; r < n2; r++) r7[r] = original[r].clone();
        Solution.rotateImage(r7);
        Solution.rotateImage(r7);
        Solution.rotateImage(r7);
        Solution.rotateImage(r7);
        check("rotateImage: four rotations restore a 10x10 matrix", java.util.Arrays.deepEquals(r7, original));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
