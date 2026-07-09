import java.util.ArrayList;
import java.util.List;

class Solution {

    /**
     * Returns true if no row, column, or 3x3 box contains a repeated digit.
     * board is 9x9; cells are '1'..'9' or '.' (ignored).
     */
    public static boolean isValidSudoku(char[][] board) {
        // TODO: nine HashSets each for rows/cols/boxes, each slot its own
        // new HashSet<>() in a loop; box index is (r/3)*3 + (c/3)
        return false;
    }

    /** Returns all elements of an m x n matrix in clockwise spiral order. */
    public static List<Integer> spiralOrder(int[][] matrix) {
        // TODO: four boundaries (top/bottom/left/right) shrinking inward;
        // re-check top <= bottom and left <= right before the return legs
        return new ArrayList<>();
    }

    /**
     * Rotates an n x n matrix 90 degrees clockwise, in place.
     * Return type is void — mutate matrix, the caller reads it after the call.
     */
    public static void rotateImage(int[][] matrix) {
        // TODO: transpose in place (swap only where c > r), then reverse each row
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
