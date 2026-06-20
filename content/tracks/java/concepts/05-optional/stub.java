import java.util.*;

public class Solution {

    // parseIntSafe returns Optional.of(n) if s is a valid integer, else empty.
    public static Optional<Integer> parseIntSafe(String s) {
        // TODO
        return Optional.empty();
    }

    // firstLongWord returns the first word with length >= minLen, or empty.
    public static Optional<String> firstLongWord(List<String> words, int minLen) {
        // TODO
        return Optional.empty();
    }

    // sumOptionals returns the sum of all present values.
    public static int sumOptionals(List<Optional<Integer>> opts) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(parseIntSafe("42"));       // Optional[42]
        System.out.println(parseIntSafe("abc"));      // Optional.empty
        System.out.println(firstLongWord(List.of("hi", "hello", "world"), 5));  // Optional[hello]
        System.out.println(sumOptionals(List.of(Optional.of(1), Optional.empty(), Optional.of(3)))); // 4
    }
}
