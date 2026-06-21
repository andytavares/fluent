import java.util.Arrays;
import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // twoSum
        check("twoSum: [2,7,11,15] t=9 -> [0,1]",
              Arrays.equals(Solution.twoSum(new int[]{2,7,11,15}, 9), new int[]{0,1}));
        check("twoSum: [3,2,4] t=6 -> [1,2]",
              Arrays.equals(Solution.twoSum(new int[]{3,2,4}, 6), new int[]{1,2}));
        check("twoSum: duplicate values [3,3] t=6 -> [0,1]",
              Arrays.equals(Solution.twoSum(new int[]{3,3}, 6), new int[]{0,1}));
        check("twoSum: negatives [-3,4,7] t=1 -> [0,1]",
              Arrays.equals(Solution.twoSum(new int[]{-3,4,7}, 1), new int[]{0,1}));
        check("twoSum: answer at end",
              Arrays.equals(Solution.twoSum(new int[]{1,5,3,2}, 3), new int[]{0,3}));

        // groupAnagrams
        List<List<String>> ga1 = Solution.groupAnagrams(
            new String[]{"eat","tea","tan","ate","nat","bat"});
        check("groupAnagrams: 3 groups", ga1.size() == 3);
        check("groupAnagrams: eat/tea/ate group", ga1.stream().anyMatch(g ->
            g.size() == 3 && g.containsAll(List.of("eat","tea","ate"))));
        check("groupAnagrams: tan/nat group", ga1.stream().anyMatch(g ->
            g.size() == 2 && g.containsAll(List.of("tan","nat"))));
        check("groupAnagrams: bat group", ga1.stream().anyMatch(g ->
            g.size() == 1 && g.contains("bat")));
        check("groupAnagrams: single word",
              Solution.groupAnagrams(new String[]{"a"}).size() == 1);
        check("groupAnagrams: empty string",
              Solution.groupAnagrams(new String[]{""}).size() == 1);

        // longestConsecutiveSequence
        check("lcs: [100,4,200,1,3,2] -> 4",
              Solution.longestConsecutiveSequence(new int[]{100,4,200,1,3,2}) == 4);
        check("lcs: [0,3,7,2,5,8,4,6,0,1] -> 9",
              Solution.longestConsecutiveSequence(new int[]{0,3,7,2,5,8,4,6,0,1}) == 9);
        check("lcs: empty -> 0",
              Solution.longestConsecutiveSequence(new int[]{}) == 0);
        check("lcs: single element -> 1",
              Solution.longestConsecutiveSequence(new int[]{5}) == 1);
        check("lcs: all duplicates [1,1,1] -> 1",
              Solution.longestConsecutiveSequence(new int[]{1,1,1}) == 1);
        check("lcs: no consecutive -> 1",
              Solution.longestConsecutiveSequence(new int[]{10,20,30}) == 1);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
