import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

class Solution {

    /**
     * Returns true if no row, column, or 3x3 box contains a repeated digit.
     * One pass with a Set per row, column, and box; '.' cells impose nothing.
     * O(81) time / O(81) entries — constant for the fixed board.
     */
    public static boolean isValidSudoku(char[][] board) {
        @SuppressWarnings("unchecked")
        Set<Character>[] rows = new HashSet[9];
        @SuppressWarnings("unchecked")
        Set<Character>[] cols = new HashSet[9];
        @SuppressWarnings("unchecked")
        Set<Character>[] boxes = new HashSet[9];
        for (int i = 0; i < 9; i++) {
            rows[i] = new HashSet<>();
            cols[i] = new HashSet<>();
            boxes[i] = new HashSet<>();
        }

        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                char v = board[r][c];
                if (v == '.') continue;
                int b = (r / 3) * 3 + (c / 3);
                if (rows[r].contains(v) || cols[c].contains(v) || boxes[b].contains(v)) {
                    return false;
                }
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
     */
    public static List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> result = new ArrayList<>();
        if (matrix.length == 0) return result;

        int top = 0;
        int bottom = matrix.length - 1;
        int left = 0;
        int right = matrix[0].length - 1;

        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) result.add(matrix[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) result.add(matrix[r][right]);
            right--;
            if (top <= bottom) {
                for (int c = right; c >= left; c--) result.add(matrix[bottom][c]);
                bottom--;
            }
            if (left <= right) {
                for (int r = bottom; r >= top; r--) result.add(matrix[r][left]);
                left++;
            }
        }
        return result;
    }

    /**
     * Rotates an n x n matrix 90 degrees clockwise, in place.
     * Transpose (swap across the diagonal, upper triangle only) then reverse
     * each row: (r,c) -> (c,r) -> (c,n-1-r), exactly the clockwise rotation.
     * O(n^2) time, O(1) space.
     */
    public static void rotateImage(int[][] matrix) {
        int n = matrix.length;
        for (int r = 0; r < n; r++) {
            for (int c = r + 1; c < n; c++) {
                int tmp = matrix[r][c];
                matrix[r][c] = matrix[c][r];
                matrix[c][r] = tmp;
            }
        }
        for (int[] row : matrix) {
            for (int i = 0, j = row.length - 1; i < j; i++, j--) {
                int tmp = row[i];
                row[i] = row[j];
                row[j] = tmp;
            }
        }
    }

    public static void main(String[] args) {
        char[][] board = {
            {'5', '3', '.', '.', '7', '.', '.', '.', '.'},
            {'6', '.', '.', '1', '9', '5', '.', '.', '.'},
            {'.', '9', '8', '.', '.', '.', '.', '6', '.'},
            {'8', '.', '.', '.', '6', '.', '.', '.', '3'},
            {'4', '.', '.', '8', '.', '3', '.', '.', '1'},
            {'7', '.', '.', '.', '2', '.', '.', '.', '6'},
            {'.', '6', '.', '.', '.', '.', '2', '8', '.'},
            {'.', '.', '.', '4', '1', '9', '.', '.', '5'},
            {'.', '.', '.', '.', '8', '.', '.', '7', '9'},
        };
        System.out.println(isValidSudoku(board)); // true

        System.out.println(spiralOrder(new int[][]{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}));
        // [1, 2, 3, 6, 9, 8, 7, 4, 5]

        int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        rotateImage(m);
        System.out.println(java.util.Arrays.deepToString(m)); // [[7,4,1],[8,5,2],[9,6,3]]
    }
}
