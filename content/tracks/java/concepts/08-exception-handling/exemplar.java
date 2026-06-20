import java.util.List;

public class Solution {

    public static class AppException extends RuntimeException {
        private final int code;

        public AppException(String message, int code) {
            super(message);
            this.code = code;
        }

        public int getCode() { return code; }
    }

    public static int parsePositiveInt(String s) {
        int value;
        try {
            value = Integer.parseInt(s);
        } catch (NumberFormatException e) {
            throw new AppException("not a number", 400);
        }
        if (value <= 0) throw new AppException("must be positive", 422);
        return value;
    }

    public static String safeRead(String input) {
        if (input == null) throw new AppException("null input", 400);
        String trimmed = input.trim();
        if (trimmed.isEmpty()) throw new AppException("blank input", 400);
        return trimmed;
    }

    public static int sumInts(List<String> strs) {
        int sum = 0;
        for (String s : strs) sum += parsePositiveInt(s);
        return sum;
    }

    public static void main(String[] args) {
        try {
            System.out.println(parsePositiveInt("42"));
        } catch (AppException e) {
            System.out.println("error: " + e.getMessage());
        }
    }
}
