import java.util.*;
import java.util.stream.*;

public class Solution {

    // longWords returns words with length >= minLen, sorted alphabetically.
    public static List<String> longWords(List<String> words, int minLen) {
        // TODO
        return List.of();
    }

    // groupByLength groups words by their character count.
    public static Map<Integer, List<String>> groupByLength(List<String> words) {
        // TODO
        return Map.of();
    }

    // averageOfEvens returns the average of even numbers, or empty if none.
    public static OptionalDouble averageOfEvens(List<Integer> nums) {
        // TODO
        return OptionalDouble.empty();
    }

    public static void main(String[] args) {
        List<String> words = List.of("the", "quick", "brown", "fox", "jumps");
        System.out.println(longWords(words, 4));
        System.out.println(groupByLength(words));
        System.out.println(averageOfEvens(List.of(1, 2, 3, 4, 5, 6)));
    }
}
