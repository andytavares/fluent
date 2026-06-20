import java.util.*;

public class Solution {

    public static Optional<Integer> parseIntSafe(String s) {
        try {
            return Optional.of(Integer.parseInt(s));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    public static Optional<String> firstLongWord(List<String> words, int minLen) {
        return words.stream()
            .filter(w -> w.length() >= minLen)
            .findFirst();
    }

    public static int sumOptionals(List<Optional<Integer>> opts) {
        return opts.stream()
            .filter(Optional::isPresent)
            .mapToInt(Optional::get)
            .sum();
    }

    public static void main(String[] args) {
        System.out.println(parseIntSafe("42"));
        System.out.println(parseIntSafe("abc"));
        System.out.println(firstLongWord(List.of("hi", "hello", "world"), 5));
        System.out.println(sumOptionals(List.of(Optional.of(1), Optional.empty(), Optional.of(3))));
    }
}
