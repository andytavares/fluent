import java.util.*;
import java.util.stream.*;

public class Solution {

    public static List<String> longWords(List<String> words, int minLen) {
        return words.stream()
            .filter(w -> w.length() >= minLen)
            .sorted()
            .collect(Collectors.toList());
    }

    public static Map<Integer, List<String>> groupByLength(List<String> words) {
        return words.stream()
            .collect(Collectors.groupingBy(String::length));
    }

    public static OptionalDouble averageOfEvens(List<Integer> nums) {
        return nums.stream()
            .filter(n -> n % 2 == 0)
            .mapToDouble(Integer::doubleValue)
            .average();
    }

    public static void main(String[] args) {
        List<String> words = List.of("the", "quick", "brown", "fox", "jumps");
        System.out.println(longWords(words, 4));
        System.out.println(groupByLength(words));
        System.out.println(averageOfEvens(List.of(1, 2, 3, 4, 5, 6)));
    }
}
