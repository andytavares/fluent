import java.util.List;

public class Solution {

    public static class AppException extends RuntimeException {
        private final int code;

        public AppException(String message, int code) {
            super(message);
            // TODO: store code
            this.code = 0; // TODO
        }

        public int getCode() {
            // TODO
            return 0;
        }
    }

    // parsePositiveInt parses s as a positive integer.
    // Throws AppException("not a number", 400) if not parseable.
    // Throws AppException("must be positive", 422) if value <= 0.
    public static int parsePositiveInt(String s) {
        // TODO
        return 0;
    }

    // safeRead trims and validates input.
    // Throws AppException("null input", 400) if null.
    // Throws AppException("blank input", 400) if blank after trim.
    public static String safeRead(String input) {
        // TODO
        return "";
    }

    // sumInts calls parsePositiveInt on each string and sums the results.
    // Re-throws the first AppException encountered.
    public static int sumInts(List<String> strs) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        try {
            System.out.println(parsePositiveInt("42"));
        } catch (AppException e) {
            System.out.println("error: " + e.getMessage());
        }
    }
}
